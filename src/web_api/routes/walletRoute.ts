import * as express from "express";
import {Request, Response} from "express-serve-static-core";
import {inject, injectable} from "inversify";
import {TYPES} from "../../common/ioc/types";
import {WalletService} from "../services/walletService";
import {CreateWalletRequest} from "../../common/models";

@injectable()
export class WalletRoute {

    constructor(@inject(TYPES.WalletService) private readonly walletService: WalletService) {
        this.walletService = walletService;
    }

    public readonly createWalletHandler: express.RequestHandler = ((req: CreateWalletRequest & Request, res: Response) => {
        this.walletService.createWallet(req);
        res.status(202).send();
    }) as any as express.RequestHandler;

    public readonly getWalletHandler: express.RequestHandler = async (req: GetWalletRequest, res: Response) => {
        const wallet = await this.walletService.getWallet(req.params.wallet_address);
        res.status(200).send(wallet);
    };

    public readonly getWalletPayments: express.RequestHandler = async (req: GetWalletPaymentsRequest, res: Response) => {
        const payments = await this.walletService.getWalletPayments(req.params.wallet_address);
        res.status(200).send({payments: payments});
    };

}

type GetWalletRequest = Request & {
    params: {
        wallet_address: string
    }
};
type GetWalletPaymentsRequest = Request & {
    params: {
        wallet_address: string
    }
};

