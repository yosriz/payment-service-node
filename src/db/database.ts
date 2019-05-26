import {Payment} from "../models";

export interface Database {
    getPayment(paymentId: string): Promise<Payment>;

    doesPaymentExist(paymentId: string): Promise<boolean>;
}
