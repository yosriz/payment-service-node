import {promisify} from "util";
import {RedisClient} from "redis";

type RedisAsyncFunctions = {
    get(key: string): Promise<string>;
    exists(key: string): Promise<number>;
    mget(...key: string[]): Promise<string[]>;
    set(key: string, value: string, mode?: string, expiration?: number): Promise<"OK">;
    sadd(key: string, value: string): Promise<"OK">;
    srem(key: string, value: string): Promise<number>;
    setex(key: string, seconds: number, value: string): Promise<"OK">;
    del(key: string): Promise<number>;
    incrby(key: string, incValue: number): Promise<number>;
};

export type RedisAsyncClient = RedisClient & {
    async: RedisAsyncFunctions;
};

export function createRedisClient(redisUrl: string): RedisAsyncClient {
    const redis = require("redis");
    const client = redis.createClient(redisUrl);
    client.async = {} as RedisAsyncFunctions;
    ["get", "EXISTS", "mget", "set", "sadd", "srem", "setex", "del", "incrby"].forEach(name => {
        (client.async as any)[name.toLowerCase()] = promisify((client as any)[name]).bind(client);
    });
    return client;
}
