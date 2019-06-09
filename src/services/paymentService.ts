import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { MessageBroker } from "../message_queue/messageBroker";
import { Kin } from "../blockchain/kin";
import { Payment, PaymentRequest } from "../models";
import { NoSuchServiceError, PaymentAlreadyExistsError, PaymentNotFoundError } from "../errors";
import { Database } from "../db/database";

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
