import "reflect-metadata";

import {Container} from "inversify";
import {Logger} from "../../common/logging";
import {Config} from "../../common/config";
import {PaymentApp} from "../app";
import {WalletRoute} from "../routes/walletRoute";
import {WatchersRoute} from "../routes/watchersRoute";
import {PaymentsRoute} from "../routes/paymentsRoute";
import {AppInfoRoute} from "../routes/appInfoRoute";
import {MessageBroker} from "../../common/message_queue/messageBroker";
import {RedisMessageBroker} from "../../common/message_queue/redisMessageBroker";
import {Metrics} from "../../common/metrics/metrics";
import {StatsDMetrics} from "../../common/metrics/statsD";
import {StatsD} from "hot-shots";
import {AppSeeds, Kin} from "../../common/blockchain/kin";
import {Environment, KinClient} from "@kinecosystem/kin-sdk-node";
import {WalletService} from "../services/walletService";
import {Database} from "../../common/db/database";
import {RedisDb} from "../../common/db/redisDb";
import {PaymentService} from "../services/paymentService";
import {WatcherService} from "../services/watcherService";
import {createRedisClient} from "../../common/redis";
import {WhitelistService} from "../services/whitelistService";
import {WhitelistRoute} from "../routes/whitelistRoute";
import {TYPES} from "../../common/ioc/types";


export const container = new Container();

const config = Config.load("config/default.json");
const logger = Logger.init(...config.loggers!);
const statsd = new StatsD(Object.assign({prefix: "payment."}, config.statsd));
const redisClient = createRedisClient(config.redis_url);
const Queue = require("bull");
const queue = new Queue("payment");

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<PaymentApp>(TYPES.PaymentApp).to(PaymentApp);
container.bind<WalletRoute>(TYPES.WalletRoute).to(WalletRoute);
container.bind<WatchersRoute>(TYPES.WatchersRoute).to(WatchersRoute);
container.bind<PaymentsRoute>(TYPES.PaymentsRoute).to(PaymentsRoute);
container.bind<AppInfoRoute>(TYPES.AppInfoRoute).to(AppInfoRoute);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(queue, logger));
container.bind<Database>(TYPES.Database).toConstantValue(new RedisDb(redisClient, 500));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
container.bind<Kin>(TYPES.Kin).toConstantValue(createKin());
container.bind<WalletService>(TYPES.WalletService).to(WalletService);
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<WatcherService>(TYPES.WatcherService).to(WatcherService);
container.bind<WhitelistService>(TYPES.WhitelistService).to(WhitelistService);
container.bind<WhitelistRoute>(TYPES.WhitelistRoute).to(WhitelistRoute);

function createKin() {
    const kinClient = new KinClient(new Environment({
        name: config.app_name ? config.app_name : "",
        passphrase: config.network_id,
        url: config.horizon_url
    }));
    return new Kin(kinClient, config.channels_seed, config.channels_salt, config.channels_count, config.apps_seeds as AppSeeds);
}
