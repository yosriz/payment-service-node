import { MessageBroker } from "./messageBroker";
import {
    CreateWalletJob,
    CreateWalletRequest,
    Payment,
    PaymentCallbackJob,
    PaymentRequest,
    SendPaymentJob,
    Wallet,
    WalletCreatedCallbackJob,
    WorkerJob
} from "../models";
import { ProcessCallbackFunction, Queue } from "bull";
import { Logger } from "../logging";

export class RedisMessageBroker implements MessageBroker {
    private readonly jobOptions = {
        removeOnComplete: true,
        removeOnFail: true
    };

    constructor(private readonly queue: Queue, private readonly logger: Logger) {
        this.queue = queue;
        this.logger = logger;
    }

    async enqueueCreateWallet(request: CreateWalletRequest) {
        const job = await this.queue.add(<CreateWalletJob>{request: request}, this.jobOptions);
        this.logger.info("enqueue create wallet result" + {result: job, wallet_request: request});
    }

    async enqueueSendPayment(request: PaymentRequest) {
        const job = await this.queue.add(<SendPaymentJob>{request: request}, this.jobOptions);
        this.logger.info("enqueue send payment result" + {result: job, payment_request: request});
    }

    async enqueuePaymentCallback(callback: string, appId: string, paymentType: "send" | "receive", payment: Payment): Promise<void> {
        const job = await this.queue.add(<PaymentCallbackJob>{
            request: {
                callback: callback,
                appId: appId,
                object: "payment",
                state: "success",
                action: paymentType,
                value: payment
            }
        }, this.jobOptions);
        this.logger.info("enqueue payment callback result" + {result: job, payment: payment});
    }

    registerJobProcessor(concurrency: number, processFn: ProcessCallbackFunction<WorkerJob>): void {
        this.queue.process(concurrency, processFn);
    }

    async enqueueWalletFailedCallback(request: CreateWalletRequest, reason: string): Promise<void> {
        const job = await this.queue.add(<WalletCreatedCallbackJob>{
            request: {
                callback: request.callback,
                appId: request.app_id,
                object: "wallet",
                state: "fail",
                action: "create",
                value: {id: request.id, reason: reason}
            }
        }, this.jobOptions);
        this.logger.info("enqueue create wallet callback failed" + {
            result: job,
            create_wallet_request: request,
            reason: reason
        });
    }

    async enqueueWalletCreatedCallback(request: CreateWalletRequest, wallet: Wallet): Promise<void> {
        const job = await this.queue.add(<WalletCreatedCallbackJob>{
            request: {
                callback: request.callback,
                appId: request.app_id,
                object: "wallet",
                state: "success",
                action: "create",
                value: wallet
            }
        }, this.jobOptions);
        this.logger.info("enqueue create wallet callback success" + {
            result: job,
            create_wallet_request: request
        });
    }

    async enqueuePaymentFailedCallback(request: PaymentRequest, reason: string): Promise<void> {
        const job = await this.queue.add(<PaymentCallbackJob>{
            request: {
                callback: request.callback,
                appId: request.app_id,
                object: "payment",
                state: "fail",
                action: "send",
                value: {id: request.id, reason: reason}
            }
        }, this.jobOptions);
        this.logger.info("enqueue payment callback result" + {
            result: job,
            payment_request: request, reason: reason
        });
    }
}
