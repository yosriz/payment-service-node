import { MessageBroker } from "../common/message_queue/messageBroker";
import { WalletCreator } from "./walletCreator";
import { PaymentSender } from "./paymentSender";
import { CallbackCaller } from "./callbackCaller";
import { CreateWalletCallbackRequest, PaymentCallbackRequest } from "../common/models";

export class WorkerApp {

    constructor(private readonly messageBroker: MessageBroker,
                private readonly concurrentJobs: number,
                private readonly walletCreator: WalletCreator,
                private readonly paymentSender: PaymentSender,
                private readonly callbackCaller: CallbackCaller) {
        this.messageBroker = messageBroker;
        this.concurrentJobs = concurrentJobs;
        this.walletCreator = walletCreator;
    }

    public run() {
        this.messageBroker.registerJobProcessor(this.concurrentJobs, async (job, done) => {
            try {
                const workerJob = job.data;
                switch (workerJob.type) {
                    case "CreateWallet":
                        await this.walletCreator.create(workerJob.request);
                        break;
                    case "SendPayment":
                        await this.paymentSender.pay(workerJob.request);
                        break;
                    case "PaymentCallback":
                        const request: PaymentCallbackRequest = workerJob.request;
                        await this.callbackCaller.call(request.callback, request.appId, request.object, request.state, request.action, request.value);
                        break;
                    case "WalletCreatedCallback":
                        const walletRequest: CreateWalletCallbackRequest = workerJob.request;
                        await this.callbackCaller.call(walletRequest.callback, walletRequest.appId, walletRequest.object, walletRequest.state, walletRequest.action, walletRequest.value);
                        break;
                }
                done();
            } catch (e) {
                done(e);
            }
        });
    }
}