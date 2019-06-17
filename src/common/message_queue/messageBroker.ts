import { CreateWalletRequest, Payment, PaymentRequest, Wallet, WorkerJob } from "../models";
import { ProcessCallbackFunction } from "bull";

export interface MessageBroker {
    enqueueCreateWallet(request: CreateWalletRequest): Promise<void>;

    enqueueSendPayment(payment: PaymentRequest): Promise<void>;

    enqueuePaymentCallback(callback: string, appId: string, paymentType: "send" | "receive", payment: Payment): Promise<void>;

    enqueueWalletFailedCallback(request: CreateWalletRequest, reason: string): Promise<void>;

    enqueueWalletCreatedCallback(request: CreateWalletRequest, wallet: Wallet): Promise<void>;

    enqueuePaymentFailedCallback(request: PaymentRequest, reason: string): Promise<void>;

    registerJobProcessor(concurrency: number, processFn: ProcessCallbackFunction<WorkerJob>): void;
}
