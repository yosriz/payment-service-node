import * as express from "express";
import {Request, Response} from "express-serve-static-core";
import {inject, injectable} from "inversify";
import {TYPES} from "../../common/ioc/types";
import {WhitelistService} from "../services/whitelistService";

@injectable()
export class WhitelistRoute {

    constructor(@inject(TYPES.WhitelistService) private readonly whitelistService: WhitelistService) {
        this.whitelistService = whitelistService;
    }

    public readonly whitelist: express.RequestHandler = (req: WhitelistRequest, res: Response) => {
        const whitelistedTx = this.whitelistService.whitelistTransaction(req.body);
        res.status(200).send({tx: whitelistedTx});
    };
}


type WhitelistRequest = Request & {
    body: WhitelistRequest;
};
