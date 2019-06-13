import { Payment } from "../models";

export interface Database {
    getPayment(paymentId: string): Promise<Payment | undefined>;

    doesPaymentExist(paymentId: string): Promise<boolean>;

    doesServiceExists(serviceId: string): Promise<boolean>;

    addService(serviceId: string, callbackUrl: string): Promise<void>;

    addWatcher(serviceId: string, address: string, orderId: string): Promise<void>;

    removeWatcher(serviceId: string, address: string, orderId: string): Promise<void>;
}
