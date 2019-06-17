import { inject, injectable } from "inversify";
import { MessageBroker } from "../common/message_queue/messageBroker";
import { Database } from "../common/db/database";
import { Kin } from "../common/blockchain/kin";
import { Logger } from "../common/logging";
import { PaymentTransaction } from "@kinecosystem/kin-sdk-node";
import { Metrics } from "../common/metrics/metrics";
import { Payment } from "../common/models";
import { parseMemo } from "../common/utils";
import { TYPES } from "../common/ioc/types";
import { performance } from "perf_hooks";

@injectable()
export class WatcherProcessor {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.Metrics) private readonly metrics: Metrics,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.kin = kin;
        this.db = db;
        this.messageBroker = messageBroker;
        this.logger = logger;
        this.metrics = metrics;
    }

    async processPayments() {
        const startTime = performance.now();
        const addresses = await this.db.getAllWatchedAddresses();
        this.logger.debug("addresses to watch = " + addresses);
        const cursor = await this.db.getCursor();
        this.logger.debug("got last cursor = " + cursor);
        const data = await this.kin.getLatestPaymentTransactions(addresses, cursor);
        for (const paymentData of data.payments) {
            this.logger.info("found transaction for address = " + paymentData.watchedAddress);
            const payment = this.parsePayment(paymentData.tx);
            await this.enqueuePaymentCallback(payment, paymentData.watchedAddress);
        }
        if (data.pagingToken) {
            this.logger.debug("save last cursor = " + data.pagingToken);
            await this.db.saveCursor(data.pagingToken);
        }
        this.metrics.watcherBeat(performance.now() - startTime);
        this.metrics.watcherCursor(parseInt(data.pagingToken!!));
    }

    private parsePayment(tx: PaymentTransaction) {
        const memo = parseMemo(tx.memo!!);
        const payment: Payment = {
            amount: tx.amount,
            app_id: memo.appId,
            id: memo.paymentId,
            recipient_address: tx.destination,
            sender_address: tx.source,
            timestamp: tx.timestamp,
            transaction_id: tx.hash
        };
        return payment;
    }

    private async enqueuePaymentCallback(payment: Payment, watchedAddress: string) {
        this.logger.info(`got payment address = ${watchedAddress}, payment = ${payment})`);
        this.metrics.paymentObserved(payment.amount, payment.app_id, watchedAddress);
        for (const serviceId of await this.db.getServicesByWatchedAddress(watchedAddress)) {
            const callbackUrl = await this.db.getService(serviceId);
            await this.messageBroker.enqueuePaymentCallback(callbackUrl, payment.app_id, payment.sender_address == watchedAddress ? "send" : "receive", payment);
        }
    }
}
