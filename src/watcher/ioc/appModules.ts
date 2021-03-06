import "reflect-metadata";

import { Container } from "inversify";
import { TYPES } from "../../common/ioc/types";
import { Logger } from "../../common/logging";
import { Config } from "../../common/config";
import { MessageBroker } from "../../common/message_queue/messageBroker";
import { RedisMessageBroker } from "../../common/message_queue/redisMessageBroker";
import { Metrics } from "../../common/metrics/metrics";
import { StatsDMetrics } from "../../common/metrics/statsD";
import { Kin } from "../../common/blockchain/kin";
import { Database } from "../../common/db/database";
import { RedisDb } from "../../common/db/redisDb";
import { WatcherApp } from "../app";
import { WatcherProcessor } from "../watcherProcessor";
import { config, createKin, logger, queue, redisClient, statsd } from "../../common/ioc";


export const container = new Container();

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<WatcherApp>(TYPES.WatcherApp).to(WatcherApp);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(queue, logger));
container.bind<Database>(TYPES.Database).toConstantValue(new RedisDb(redisClient, 500));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
container.bind<Kin>(TYPES.Kin).toConstantValue(createKin());
container.bind<WatcherProcessor>(TYPES.WatcherProcessor).to(WatcherProcessor);
