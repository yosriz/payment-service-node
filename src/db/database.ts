import { Payment } from "../models";

export interface Database {
    getPayment(paymentId: string): Promise<Payment | undefined>;

    doesPaymentExist(paymentId: string): Promise<boolean>;
}
