import "reflect-metadata";

import {Container} from "inversify";
import {TYPES} from "./types";
import {Logger} from "../logging";
import {Config} from "../config";
import {PaymentApp} from "../app";
import {WalletRoute} from "../walletRoute";
import {WatchersRoute} from "../watchersRoute";
import {PaymentsRoute} from "../paymentsRoute";
import {AppInfoRoute} from "../appInfoRoute";
import {MessageBroker} from "../message_queue/messageBroker";
import {createRedisClient, RedisMessageBroker} from "../message_queue/redisMessageBroker";
import {Metrics} from "../metrics/metrics";
import {StatsDMetrics} from "../metrics/statsD";
import {StatsD} from "hot-shots";


export const container = new Container();

const config = Config.load('config/default.json');
const logger = Logger.init(...config.loggers!);
const statsd = new StatsD(Object.assign({prefix: "payment."}, config.statsd));
const redisClient = createRedisClient(config.redis_url);

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<PaymentApp>(TYPES.PaymentApp).to(PaymentApp);
container.bind<WalletRoute>(TYPES.WalletRoute).to(WalletRoute);
container.bind<WatchersRoute>(TYPES.WatchersRoute).to(WatchersRoute);
container.bind<PaymentsRoute>(TYPES.PaymentsRoute).to(PaymentsRoute);
container.bind<AppInfoRoute>(TYPES.AppInfoRoute).to(AppInfoRoute);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(redisClient));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
