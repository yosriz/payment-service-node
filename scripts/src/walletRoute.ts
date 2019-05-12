import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { Logger } from "./logging";
import { inject, injectable } from "inversify";
import { TYPES } from "./ioc/types";
import { MessageBroker } from "./message_queue/messageBroker";
import { Metrics } from "./metrics/metrics";
import CreateWalletRequest = WalletRoute.CreateWalletRequest;

@injectable()
export class WalletRoute {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.MessageBroker) private readonly metrics: Metrics) {
        this.logger = logger;
    }

    public readonly createWalletHandler: express.RequestHandler = ((req: CreateWalletRequest, res: Response) => {
        this.messageBroker.enqueueCreateWallet(req);
        res.status(202).send();
    }) as any as express.RequestHandler;

    public readonly getWalletHandler: express.RequestHandler = (req: Request, res: Response) => {
    };

    public readonly getWalletPayments: express.RequestHandler = (req: Request, res: Response) => {
    };

}

export namespace WalletRoute {
    export interface CreateWalletRequest {
        wallet_address: string,
        app_id: string,
        id: string,
        callback: string
    }
}
