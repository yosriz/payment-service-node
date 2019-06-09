import { Payment } from "../models";

export interface Database {
    getPayment(paymentId: string): Promise<Payment | undefined>;

    doesPaymentExist(paymentId: string): Promise<boolean>;

    doesServiceExists(serviceId: string): Promise<boolean>;

    addService(serviceId: string, callbackUrl: string): Promise<void>;
}
