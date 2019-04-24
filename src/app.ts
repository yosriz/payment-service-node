import * as express from 'express'
import {Config} from "./config";
import {Logger} from "./logging";
import {GeneralErrorMiddleware, NotFoundMiddleware} from "./middleware";

export class PaymentApp {

    public readonly config: Config;
    public readonly logger: Logger;

    public constructor() {
        this.config = Config.load('config/default.json');
        this.logger = Logger.init(...this.config.loggers!);
    }

    public async init() {

    }

    public createExpress(): express.Express {
        const app = express();

        app.set('port', this.config.port);

        const bodyParser = require("body-parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        // catch 404
        app.use(new NotFoundMiddleware().handler());
        // catch errors
        app.use(new GeneralErrorMiddleware(this.logger).handler());
        return app;
    }
}
