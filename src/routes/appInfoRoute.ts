import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { Config } from "../config";

@injectable()
export class AppInfoRoute {

    constructor(@inject(TYPES.Config) private readonly config: Config) {
        this.config = config;
    }

    public readonly statusHandler: express.RequestHandler = (req: Request, res: Response) => {
        res.status(202).send({app_name: this.config.app_name, status: "ok"});
    };

    public readonly configHandler: express.RequestHandler = (req: Request, res: Response) => {
        res.status(200).send({
            "horizon_url": this.config.horizon_url,
            "network_passphrase": this.config.network_id
        });
    };
}
