import { RedisAsyncClient } from "../redis";
import * as Redlock from "redlock";
import { Logger } from "../logging";

export class Locker {
    private readonly redLock: Redlock;

    constructor(private readonly logger: Logger,
                private readonly redis: RedisAsyncClient,
                private readonly ttl = 120) {
        this.redLock = new Redlock([redis]);
    }

    public async lock<T>(lockId: string, func: () => Promise<T>): Promise<T | undefined> {
        try {
            const lock = await this.redLock.acquire(lockId, this.ttl);
            const retVal = await func();
            await lock.unlock();
            return retVal;
        } catch (e) {
            this.logger.error("failed to release lock: " + lockId);
        }
        return undefined;
    }
}