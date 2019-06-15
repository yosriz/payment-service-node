import {MessageBroker} from "./messageBroker";
import {CreateWalletRequest, PaymentRequest} from "../models";
import {Queue} from "bull";
import {Logger} from "../logging";

export class RedisMessageBroker implements MessageBroker {

    constructor(private readonly queue: Queue, private readonly logger: Logger) {
        this.queue = queue;
        this.logger = logger;
    }

    async enqueueCreateWallet(request: CreateWalletRequest) {
        const job = await this.queue.add(request, {removeOnComplete: true, removeOnFail: true});
        this.logger.info("enqueue create wallet result" + {result: job, wallet_request: request});
    }

    async enqueueSendPayment(request: PaymentRequest) {
        const job = await this.queue.add(request, {removeOnComplete: true, removeOnFail: true});
        this.logger.info("enqueue send payment result" + {result: job, payment_request: request});
    }
}
