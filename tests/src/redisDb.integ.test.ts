import { RedisDb } from "../../src/common/db/redisDb";
import { createRedisClient } from "../../src/common/redis";
import { Payment } from "../../src/common/models";
import { OrderNotFoundError } from "../../src/common/errors";

describe("RedisDb Integration", () => {
    let db: RedisDb;
    const redis = createRedisClient("redis://localhost:6379");

    beforeEach(() => {
        redis.flushdb();
        db = new RedisDb(redis, 500);
    });

    afterAll(() => {
        redis.quit();
    });

    test("get and set payment", async () => {
        const payment: Payment = {
            id: "12",
            amount: 10,
            sender_address: "GBFUG2SGT653CDOBNNPOY2M6WLW7KBZMESYSECMZW3DSNS3JNGWG6TXB",
            recipient_address: "GAVEEXYGVKCTG27SJCQPDKYLB53VIILQ5DSPFMXHAP2W6JDLJ4ANMFAH",
            timestamp: "2019-06-08T16:39:04Z",
            transaction_id: "ac8689892bd9d7c0462c58f0329d4f82b5f981fdce057ab165e69dcbc43f1c54",
            app_id: "test"
        };
        expect(await db.doesPaymentExist(payment.id)).toEqual(false);
        await db.savePayment(payment);
        const retrievedPayment = await db.getPayment(payment.id);
        expect(retrievedPayment).toEqual(payment);
        expect(await db.doesPaymentExist(payment.id)).toEqual(true);
    });

    test("get and set service", async () => {
        const serviceId = "my_service";
        expect(await db.doesServiceExists(serviceId)).not.toEqual(true);
        await db.addService(serviceId, "my_callback");
        expect(await db.doesServiceExists(serviceId)).toEqual(true);
    });

    test("add and remove watcher", async () => {
        const serviceId = "my_service";
        await db.addWatcher(serviceId, "GAVEEXYGVKCTG27SJCQPDKYLB53VIILQ5DSPFMXHAP2W6JDLJ4ANMFAH", "1234");
        await db.removeWatcher(serviceId, "GAVEEXYGVKCTG27SJCQPDKYLB53VIILQ5DSPFMXHAP2W6JDLJ4ANMFAH", "1234");
    });

    test("when removing non-existing watcher expect error", async () => {
        const serviceId = "my_service";
        await expect(db.removeWatcher(serviceId, "GAVEEXYGVKCTG27SJCQPDKYLB53VIILQ5DSPFMXHAP2W6JDLJ4ANMFAH", "1234"))
            .rejects.toBeInstanceOf(OrderNotFoundError);
    });
});
