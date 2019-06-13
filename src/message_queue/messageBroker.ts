import { CreateWalletRequest, PaymentRequest } from "../models";

export interface MessageBroker {
    enqueueCreateWallet(request: CreateWalletRequest): void;

    enqueueSendPayment(payment: PaymentRequest): void;
}
