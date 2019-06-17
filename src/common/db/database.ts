import { Payment } from "../models";

export interface Database {
    getPayment(paymentId: string): Promise<Payment | undefined>;

    doesPaymentExist(paymentId: string): Promise<boolean>;

    doesServiceExists(serviceId: string): Promise<boolean>;

    addService(serviceId: string, callbackUrl: string): Promise<void>;

    getService(serviceId: string): Promise<string>;

    addWatcher(serviceId: string, address: string, orderId: string): Promise<void>;

    getAllWatchedAddresses(): Promise<string[]>;

    removeWatcher(serviceId: string, address: string, orderId: string): Promise<void>;

    getServicesByWatchedAddress(address: string): Promise<string[]>;

    getCursor(): Promise<string | null>;

    saveCursor(pagingToken: string): Promise<void>;

    savePayment(payment: Payment): Promise<void>;
}
