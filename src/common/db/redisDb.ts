import {Payment} from "../models";
import {Database} from "./database";
import {RedisAsyncClient} from "../redis";
import {OrderNotFoundError} from "../errors";

export class RedisDb implements Database {
    private readonly PAYMENT_PREFIX = "payment:";
    private readonly SERVICE_PREFIX = "service:";
    private readonly CURSOR_PREFIX = "cursor";

    constructor(private readonly redis: RedisAsyncClient, private readonly paymentStoreExpirationSec: number) {
        this.redis = redis;
        this.paymentStoreExpirationSec = paymentStoreExpirationSec;
    }

    async getPayment(paymentId: string): Promise<Payment> {
        const payment = await this.redis.async.get(this.PAYMENT_PREFIX + paymentId);
        return JSON.parse(payment);
    }

    async savePayment(payment: Payment): Promise<void> {
        await this.redis.async.set(this.PAYMENT_PREFIX + payment.id, JSON.stringify(payment), "EX", this.paymentStoreExpirationSec);
    }

    async doesPaymentExist(paymentId: string): Promise<boolean> {
        return await this.redis.async.exists(this.PAYMENT_PREFIX + paymentId) === 1;
    }

    async doesServiceExists(serviceId: string): Promise<boolean> {
        return await this.redis.async.exists(this.SERVICE_PREFIX + serviceId) === 1;
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

    async getAllWatchedAddresses(): Promise<string[]> {
        const keys = await this.redis.async.keys("*:G*");
        return keys.map(key => key.split(":")[1]);
    }

    async getCursor(): Promise<string> {
        return await this.redis.async.get(this.CURSOR_PREFIX);
    }

    async saveCursor(pagingToken: string): Promise<void> {
        await this.redis.async.set(this.CURSOR_PREFIX, pagingToken);
    }

    async getServicesByWatchedAddress(address: string): Promise<string[]> {
        const keys = await this.redis.async.keys("*:" + address);
        return keys.map(key => key.split(":")[0]);
    }

}
