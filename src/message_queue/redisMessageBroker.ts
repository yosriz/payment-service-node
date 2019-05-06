import {injectable} from "inversify";
import {WalletRoute} from "../walletRoute";
import {MessageBroker} from "./messageBroker";
import {promisify} from "util";
import {RedisClient} from "redis";

type RedisAsyncFunctions = {
    get(key: string): Promise<string>;
    mget(...key: string[]): Promise<string[]>;
    set(key: string, value: string): Promise<"OK">;
    setex(key: string, seconds: number, value: string): Promise<"OK">;
    del(key: string): Promise<number>;
    incrby(key: string, incValue: number): Promise<number>;
};

export type RedisAsyncClient = RedisClient & {
    async: RedisAsyncFunctions;
};

export function createRedisClient(redisUrl :string): RedisAsyncClient {
    const redis = require("redis");
    const client = redis.createClient(redisUrl);
    client.async = {} as RedisAsyncFunctions;
    ["get", "mget", "set", "setex", "del", "incrby"].forEach(name => {
        (client.async as any)[name] = promisify((client as any)[name]).bind(client);
    });
    return client;
}

export class RedisMessageBroker implements MessageBroker {

    constructor(private readonly redis: RedisAsyncClient) {
        this.redis = redis;
    }

    enqueueCreateWallet(request: WalletRoute.CreateWalletRequest): void {
    }

}
