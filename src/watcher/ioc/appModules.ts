import "reflect-metadata";

import {Container} from "inversify";
import {TYPES} from "../../common/ioc/types";
import {Logger} from "../../common/logging";
import {Config} from "../../common/config";
import {MessageBroker} from "../../common/message_queue/messageBroker";
import {RedisMessageBroker} from "../../common/message_queue/redisMessageBroker";
import {Metrics} from "../../common/metrics/metrics";
import {StatsDMetrics} from "../../common/metrics/statsD";
import {StatsD} from "hot-shots";
import {AppSeeds, Kin} from "../../common/blockchain/kin";
import {Environment, KinClient} from "@kinecosystem/kin-sdk-node";
import {Database} from "../../common/db/database";
import {RedisDb} from "../../common/db/redisDb";
import {createRedisClient} from "../../common/redis";
import {WatcherApp} from "../app";
import {WatcherProcessor} from "../watcherProcessor";


export const container = new Container();

const config = Config.load("config/default.json");
const logger = Logger.init(...config.loggers!);
const statsd = new StatsD(Object.assign({prefix: "payment."}, config.statsd));
const redisClient = createRedisClient(config.redis_url);
const Queue = require("bull");
const queue = new Queue("payment");

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<WatcherApp>(TYPES.WatcherApp).to(WatcherApp);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(queue, logger));
container.bind<Database>(TYPES.Database).toConstantValue(new RedisDb(redisClient, 500));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
container.bind<Kin>(TYPES.Kin).toConstantValue(createKin());
container.bind<WatcherProcessor>(TYPES.WatcherProcessor).to(WatcherProcessor);

function createKin() {
    const kinClient = new KinClient(new Environment({
        name: config.app_name ? config.app_name : "",
        passphrase: config.network_id,
        url: config.horizon_url
    }));
    return new Kin(kinClient, config.channels_seed, config.channels_salt, config.channels_count, config.apps_seeds as AppSeeds);
}

