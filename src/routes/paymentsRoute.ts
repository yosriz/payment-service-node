import { Logger } from "../logging";
import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { PaymentService } from "../services/paymentService";
import { PaymentRequest } from "../models";

@injectable()
export class PaymentsRoute {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.PaymentService) private readonly service: PaymentService) {
        this.logger = logger;
    }

    public readonly getPayment: express.RequestHandler = async (req: GetPaymentRequest, res: Response) => {
        const payment = await this.service.getPayment(req.params.payment_id);
        res.status(200).send(payment);
    };

    public readonly pay: express.RequestHandler = async (req: PayRequest, res: Response) => {
        await this.service.pay(req.body);
        res.status(201).send();
    };
}

type GetPaymentRequest = Request & {
    params: {
        payment_id: string
    }
};
type PayRequest = Request & {
    body: PaymentRequest
};
