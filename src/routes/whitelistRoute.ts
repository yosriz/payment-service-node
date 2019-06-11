import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { WhitelistService } from "../services/whitelistService";

@injectable()
export class WhitelistRoute {

    constructor(@inject(TYPES.WhitelistService) private readonly whitelistService: WhitelistService) {
        this.whitelistService = whitelistService;
    }

    public readonly whitelist: express.RequestHandler = async (req: WhitelistRequest, res: Response) => {
        await this.whitelistService.whitelistTransaction(req.body);
        res.status(200).send();
    };
}


type WhitelistRequest = Request & {
    body: WhitelistRequest;
};
