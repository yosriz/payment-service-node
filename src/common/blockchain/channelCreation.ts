import { Channels, Environment } from "@kinecosystem/kin-sdk-node";
import { Config } from "../config";
import { Logger } from "../logging";

export const config = Config.load("config/default.json");
export const logger = Logger.init(...config.loggers!);
logger.info("creating channels if needed...");
Channels.createChannels({
    environment: new Environment({
        name: config.app_name ? config.app_name : "",
        passphrase: config.network_id,
        url: config.horizon_url
    }),
    salt: config.channels_salt,
    channelsCount: config.channels_count,
    startingBalance: 1000,
    baseSeed: config.channels_seed
}).then(() => logger.info("creating channels done"));