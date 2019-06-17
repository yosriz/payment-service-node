import { assign, path } from "./utils";
import { LogTarget } from "./logging";

export interface Config {
    port?: number;
    app_name?: string;
    horizon_url: string;
    network_id: string;
    channels_seed: string;
    channels_salt: string;
    channels_count: number;
    apps_seeds: object;
    concurrent_jobs: number;
    root_wallet: string;
    loggers?: LogTarget[];
    statsd: {
        host: string;
        port: number;
    };
    redis_url: string;
}

export namespace Config {

    export function load(filePath: string): Config {
        const config = assign({}, require(path(filePath!)), {
            app_name: process.env.APP_NAME,
            port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined,
            concurrent_jobs: 50
        });
        verifyConfigParam(config.port, "port");
        verifyConfigParam(config.horizon_url, "horizon_url");
        verifyConfigParam(config.network_id, "network_id");
        verifyConfigParam(config.apps_seeds, "apps_seeds");
        verifyConfigParam(config.redis_url, "redis_url");
        return config;
    }

    function verifyConfigParam(param: any, paramName: string) {
        if (!param) {
            throw new Error(`config error! ${paramName} is not defined`);
        }
    }
}
