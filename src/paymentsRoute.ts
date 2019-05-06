import {Logger} from "./logging";
import * as express from "express";
import {Request, Response} from "express-serve-static-core";
import {inject, injectable} from "inversify";
import {TYPES} from "./ioc/types";

@injectable()
export class PaymentsRoute {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger) {
        this.logger = logger;
    }

    public readonly getPayment: express.RequestHandler = (req: Request, res: Response) => {
    };

    public readonly pay: express.RequestHandler = (req: Request, res: Response) => {
    };
}
