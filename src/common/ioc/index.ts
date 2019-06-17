import { Config } from "../config";
import { Environment, KinClient } from "@kinecosystem/kin-sdk-node";
import { Kin } from "../blockchain/kin";
import { AppSeeds } from "../models";
import { Logger } from "../logging";
import { createRedisClient } from "../redis";
import { StatsD } from "hot-shots";

export const config = Config.load("config/default.json");
export const logger = Logger.init(...config.loggers!);
export const statsd = new StatsD(Object.assign({prefix: "payment."}, config.statsd));
export const redisClient = createRedisClient(config.redis_url);
export const Queue = require("bull");
export const queue = new Queue("payment");

export function createKin() {
    const kinClient = new KinClient(new Environment({
        name: config.app_name ? config.app_name : "",
        passphrase: config.network_id,
        url: config.horizon_url
    }));
    return new Kin(kinClient, config.channels_seed, config.channels_salt, config.channels_count, config.apps_seeds as AppSeeds, config.root_wallet);
}
