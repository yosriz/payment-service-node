import {CreateWalletRequest, Payment, PaymentRequest} from "../models";

export interface MessageBroker {
    enqueueCreateWallet(request: CreateWalletRequest): Promise<void>;

    enqueueSendPayment(payment: PaymentRequest): Promise<void>;

    enqueuePaymentCallback(callback: string, paymentType: "send" | "receive", payment: Payment): Promise<void>;
}
