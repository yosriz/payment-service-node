import "reflect-metadata";

import { Container } from "inversify";
import { TYPES } from "./types";
import { Logger } from "../logging";
import { Config } from "../config";
import { PaymentApp } from "../app";
import { WalletRoute } from "../routes/walletRoute";
import { WatchersRoute } from "../routes/watchersRoute";
import { PaymentsRoute } from "../routes/paymentsRoute";
import { AppInfoRoute } from "../appInfoRoute";
import { MessageBroker } from "../message_queue/messageBroker";
import { RedisAsyncClient, RedisMessageBroker } from "../message_queue/redisMessageBroker";
import { Metrics } from "../metrics/metrics";
import { StatsDMetrics } from "../metrics/statsD";
import { StatsD } from "hot-shots";
import { AppSeeds, Kin } from "../blockchain/kin";
import { Environment, KinClient } from "@kinecosystem/kin-sdk-node";
import { WalletService } from "../services/walletService";
import { Database } from "../db/database";
import { RedisDb } from "../db/redisDb";
import { PaymentService } from "../services/paymentService";
import { WatcherService } from "../services/watcherService";


export const container = new Container();

const config = Config.load("config/default.json");
const logger = Logger.init(...config.loggers!);
const statsd = new StatsD(Object.assign({prefix: "payment."}, config.statsd));
// const redisClient = createRedisClient(config.redis_url);

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<PaymentApp>(TYPES.PaymentApp).to(PaymentApp);
container.bind<WalletRoute>(TYPES.WalletRoute).to(WalletRoute);
container.bind<WatchersRoute>(TYPES.WatchersRoute).to(WatchersRoute);
container.bind<PaymentsRoute>(TYPES.PaymentsRoute).to(PaymentsRoute);
container.bind<AppInfoRoute>(TYPES.AppInfoRoute).to(AppInfoRoute);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(undefined as any as RedisAsyncClient));
container.bind<Database>(TYPES.Database).toConstantValue(new RedisDb(undefined as any as RedisAsyncClient));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
container.bind<Kin>(TYPES.Kin).toConstantValue(createKin());
container.bind<WalletService>(TYPES.WalletService).to(WalletService);
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<WatcherService>(TYPES.WatcherService).to(WatcherService);

function createKin() {
    const kinClient = new KinClient(new Environment({
        name: config.app_name ? config.app_name : "",
        passphrase: config.network_id,
        url: config.horizon_url
    }));
    return new Kin(kinClient, config.channels_seed, config.channels_salt, config.channels_count, config.apps_seeds as AppSeeds);
}

