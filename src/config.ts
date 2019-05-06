import {path, assign} from "./utils";
import {LogTarget} from "./logging";

export interface Config {
    port?: number;
    app_name?: string;
    horizon_url? : string;
    network_id? : string;
    channels_salt? : string;
    channels_count? : number;
    loggers?: LogTarget[];
    statsd: {
		host: string;
		port: number;
	};
    redis_url: string;
}

export module Config {

    export function load(filePath: string): Config {
        return assign({}, require(path(filePath!)), {
            app_name: process.env.APP_NAME,
            port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined,
        });
    }
}
