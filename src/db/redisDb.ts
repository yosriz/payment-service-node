import { Payment } from "../models";
import { Database } from "./database";
import { RedisAsyncClient } from "../redis";
import { OrderNotFoundError } from "../errors";

export class RedisDb implements Database {

    private readonly PAYMENT_PREFIX = "payment:";
    private readonly SERVICE_PREFIX = "service:";

    constructor(private readonly redis: RedisAsyncClient) {
        this.redis = redis;
    }

    async getPayment(paymentId: string): Promise<Payment> {
        const payment = await this.redis.async.get(this.PAYMENT_PREFIX + paymentId);
        return JSON.parse(payment);
    }

    async doesPaymentExist(paymentId: string): Promise<boolean> {
        return await this.redis.async.exist(this.PAYMENT_PREFIX + paymentId);
    }

    async doesServiceExists(serviceId: string): Promise<boolean> {
        return await this.redis.async.exist(this.SERVICE_PREFIX + serviceId);
    }

    async addService(serviceId: string, callbackUrl: string): Promise<void> {
        await this.redis.async.set(this.SERVICE_PREFIX + serviceId, callbackUrl);
    }

    async addWatcher(serviceId: string, address: string, orderId: string): Promise<void> {
        await this.redis.async.sadd(`${serviceId}:${address}`, orderId);
    }

    async removeWatcher(serviceId: string, address: string, orderId: string): Promise<void> {
        const itemsChanged = await this.redis.async.srem(`${serviceId}:${address}`, orderId);
        if (itemsChanged != 1) {
            throw new OrderNotFoundError(`Wallet ${address} did not watch order ${orderId}`);
        }
    }

}
