import * as express from 'express';
import { Config } from "./config";
import { Logger } from "./logging";
import { GeneralErrorMiddleware, NotFoundMiddleware } from "./middleware";
import { WalletRoute } from "./walletRoute";
import { PaymentsRoute } from "./paymentsRoute";
import { WatchersRoute } from "./watchersRoute";
import { AppInfoRoute } from "./appInfoRoute";
import { inject, injectable } from "inversify";
import { TYPES } from "./ioc/types";

@injectable()
export class PaymentApp {

    public constructor(@inject(TYPES.Config) public readonly config: Config,
                       @inject(TYPES.Logger) public readonly logger: Logger,
                       @inject(TYPES.WalletRoute) public readonly walletRoute: WalletRoute,
                       @inject(TYPES.WatchersRoute) public readonly watchersRoute: WatchersRoute,
                       @inject(TYPES.PaymentsRoute) public readonly paymentsRoute: PaymentsRoute,
                       @inject(TYPES.AppInfoRoute) public readonly appInfoRoute: AppInfoRoute,) {
        this.config = config;
        this.logger = logger;
        this.walletRoute = walletRoute;
        this.watchersRoute = watchersRoute;
        this.paymentsRoute = paymentsRoute;
        this.appInfoRoute = appInfoRoute;
    }

    public async init() {

    }

    public createExpress(): express.Express {
        const app = express();

        app.set('port', this.config.port);

        const bodyParser = require("body-parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        this.createRoutes(app);
        // catch 404
        app.use(new NotFoundMiddleware().handler());
        // catch errors
        app.use(new GeneralErrorMiddleware(this.logger).handler());
        return app;
    }

    private createRoutes(app: express.Express) {
        app.post('/wallets', this.walletRoute.createWalletHandler);
        app.get('/wallets/:wallet_address', this.walletRoute.getWalletHandler);
        app.get('/wallets/:wallet_address/payments', this.walletRoute.getWalletPayments);
        app.get('/payments/:payment_id', this.paymentsRoute.getPayment);
        app.post('/payments/', this.paymentsRoute.pay);
        app.post('/watchers/:service_id', this.watchersRoute.addWatch);
        app.delete('/watchers/:service_id', this.watchersRoute.removeWatch);
        app.get('/status', this.appInfoRoute.status);
        app.get('/config', this.appInfoRoute.config);
    }
}
