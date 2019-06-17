import { PaymentRequest } from "../common/models";
import { inject, injectable } from "inversify";
import { TYPES } from "../common/ioc/types";
import { Logger } from "../common/logging";
import { Kin } from "../common/blockchain/kin";
import { MessageBroker } from "../common/message_queue/messageBroker";
import { Metrics } from "../common/metrics/metrics";
import { Database } from "../common/db/database";
import { Locker } from "../common/message_queue/locker";

@injectable()
export class PaymentSender {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.Metrics) private readonly metrics: Metrics,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Locker) private readonly locker: Locker,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.logger = logger;
        this.kin = kin;
        this.messageBroker = messageBroker;
        this.locker = locker;
    }

    public async pay(request: PaymentRequest) {
        await this.locker.lock(`lock:payment:${request.id}`, async () => {
            await this.performPay(request);
        });
    }

    private async performPay(request: PaymentRequest) {
        if (await this.db.doesPaymentExist(request.id)) {
            this.logger.info("payment is already complete - not double spending", {payment: request});
            return;
        }

        this.logger.info("trying to pay", {payment_id: request.id});

        try {
            const payment = await this.kin.pay(request);
            this.logger.info("paid transaction", {tx_id: payment.transaction_id, payment_id: request.id});
            this.metrics.paymentSent(request.app_id, request.amount);
            await this.db.savePayment(payment);
            this.logger.info("payment complete - submit back to callback payment.callback", {payment: payment});
            await this.messageBroker.enqueuePaymentCallback(request.callback, request.app_id, "send", payment);
            this.metrics.callbackEnqueued(request.app_id, "payment", "success", "send");
        } catch (e) {
            this.logger.error("failed to pay transaction", {error: e, payment_id: request.id});
            this.metrics.paymentFailedFailed(request.app_id);
            await this.messageBroker.enqueuePaymentFailedCallback(request, e.message);
            this.metrics.callbackEnqueued(request.app_id, "payment", "fail", "send");
        }
    }
}