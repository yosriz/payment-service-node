import {inject, injectable} from "inversify";
import {TYPES} from "../../common/ioc/types";
import {MessageBroker} from "../../common/message_queue/messageBroker";
import {Kin} from "../../common/blockchain/kin";
import {Payment, PaymentRequest} from "../../common/models";
import {NoSuchServiceError, PaymentAlreadyExistsError, PaymentNotFoundError} from "../../common/errors";
import {Database} from "../../common/db/database";

@injectable()
export class PaymentService {

    constructor(@inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.messageBroker = messageBroker;
        this.db = db;
        this.kin = kin;
    }

    async getPayment(paymentId: string): Promise<Payment> {
        const payment = await this.db.getPayment(paymentId);
        if (!payment) {
            throw new PaymentNotFoundError(paymentId);
        } else {
            return payment;
        }
    }

    async pay(payment: PaymentRequest) {
        if (await this.db.doesPaymentExist(payment.id)) {
            throw new PaymentAlreadyExistsError();
        }
        if (payment.is_external &&
            !this.kin.appsAccounts.has(payment.app_id)) {
            throw new NoSuchServiceError(`Did not find keypair for service: ${payment.app_id}.`);
        }
        this.messageBroker.enqueueSendPayment(payment);
    }
}
