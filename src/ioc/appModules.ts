import "reflect-metadata";

import {Container} from "inversify";
import {TYPES} from "./types";
import {Logger} from "../logging";
import {Config} from "../config";
import {PaymentApp} from "../app";
import {WalletRoute} from "../walletRoute";
import {WatchersRoute} from "../watchersRoute";
import {PaymentsRoute} from "../paymentsRoute";
import {AppInfoRoute} from "../appInfoRoute";
import {MessageBroker, RabbitMQBroker} from "../mq/messageBroker";


export const container = new Container();

const config = Config.load('config/default.json');
const logger = Logger.init(...config.loggers!);

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<PaymentApp>(TYPES.PaymentApp).to(PaymentApp);
container.bind<WalletRoute>(TYPES.WalletRoute).to(WalletRoute);
container.bind<WatchersRoute>(TYPES.WatchersRoute).to(WatchersRoute);
container.bind<PaymentsRoute>(TYPES.PaymentsRoute).to(PaymentsRoute);
container.bind<AppInfoRoute>(TYPES.AppInfoRoute).to(AppInfoRoute);
container.bind<MessageBroker>(TYPES.MessageBroker).to(RabbitMQBroker);
