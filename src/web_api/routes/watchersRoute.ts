import * as express from "express";
import {Request, Response} from "express-serve-static-core";
import {inject, injectable} from "inversify";
import {TYPES} from "../../common/ioc/types";
import {WatcherService} from "../services/watcherService";

@injectable()
export class WatchersRoute {

    constructor(@inject(TYPES.WatcherService) private readonly watcherService: WatcherService) {
        this.watcherService = watcherService;
    }

    public readonly addWatch: express.RequestHandler = async (req: AddWatcherRequest, res: Response) => {
        await this.watcherService.addWatcher(req.params.service_id, req.body.callback, req.body.wallet_addresses, req.body.order_id);
        res.status(200).send();
    };

    public readonly removeWatch: express.RequestHandler = async (req: RemoveWatcherRequest, res: Response) => {
        await this.watcherService.deleteWatcher(req.params.service_id, req.body.wallet_address, req.body.order_id);
        res.status(200).send();
    };
}


type AddWatcherRequest = Request & {
    params: { service_id: string },
    body: {
        wallet_addresses: string[],
        order_id: string,
        callback: string
    }
};

type RemoveWatcherRequest = Request & {
    params: { service_id: string },
    body: {
        wallet_address: string[],
        order_id: string
    }
};
