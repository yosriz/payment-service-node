import {Payment} from "../models";
import {RedisAsyncClient} from "../message_queue/redisMessageBroker";
import {Database} from "./database";

export class RedisDb implements Database {

    constructor(private readonly redis: RedisAsyncClient) {
        this.redis = redis;
    }

    async getPayment(paymentId: string): Promise<Payment> {
        return {} as Payment;
    }

    async doesPaymentExist(paymentId: string): Promise<boolean> {
        return false;
    }

}
