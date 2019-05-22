import { Logger } from "./logging";
import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { inject, injectable } from "inversify";
import { TYPES } from "./ioc/types";

@injectable()
export class AppInfoRoute {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger) {
        this.logger = logger;
    }

    public readonly status: express.RequestHandler = (req: Request, res: Response) => {
        res.status(202).send({ msg : 'hello world'});
    };

    public readonly config: express.RequestHandler = (req: Request, res: Response) => {
    };
}
