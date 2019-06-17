import "reflect-metadata";
import { Config } from "../../common/config";
import { TYPES } from "../../common/ioc/types";
import { WorkerApp } from "../app";
import { MessageBroker } from "../../common/message_queue/messageBroker";
import { Database } from "../../common/db/database";
import { Metrics } from "../../common/metrics/metrics";
import { Kin } from "../../common/blockchain/kin";
import { RedisDb } from "../../common/db/redisDb";
import { Logger } from "../../common/logging";
import { RedisMessageBroker } from "../../common/message_queue/redisMessageBroker";
import { StatsDMetrics } from "../../common/metrics/statsD";
import { Container } from "inversify";
import axios, { AxiosInstance } from "axios";
import { config, createKin, logger, queue, redisClient, statsd } from "../../common/ioc";
import { PaymentSender } from "../paymentSender";
import { WalletCreator } from "../walletCreator";
import { CallbackCaller } from "../callbackCaller";
import { Locker } from "../../common/message_queue/locker";

const axiosRetry = require("axios-retry");

export const container = new Container();

const axiosInstance = axios.create({timeout: 10_000});
axiosRetry(axiosInstance, {retries: 3});

container.bind<Config>(TYPES.Config).toConstantValue(config);
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<MessageBroker>(TYPES.MessageBroker).toConstantValue(new RedisMessageBroker(queue, logger));
container.bind<Database>(TYPES.Database).toConstantValue(new RedisDb(redisClient, 500));
container.bind<Metrics>(TYPES.Metrics).toConstantValue(new StatsDMetrics(statsd));
container.bind<Kin>(TYPES.Kin).toConstantValue(createKin());
container.bind<Locker>(TYPES.Locker).toConstantValue(new Locker(
    logger,
    redisClient,
    120
));
container.bind<AxiosInstance>(TYPES.Axios).toConstantValue(axiosInstance);
container.bind<PaymentSender>(TYPES.PaymentSender).to(PaymentSender);
container.bind<WalletCreator>(TYPES.WalletCreator).to(WalletCreator);
container.bind<CallbackCaller>(TYPES.CallbackCaller).to(CallbackCaller);
container.bind<WorkerApp>(TYPES.WorkerApp).toConstantValue(new WorkerApp(
    logger,
    container.get(TYPES.MessageBroker),
    container.get(TYPES.WalletCreator),
    container.get(TYPES.PaymentSender),
    container.get(TYPES.CallbackCaller),
    config.concurrent_jobs
));

