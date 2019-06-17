import { CreateWalletRequest, Wallet } from "../common/models";
import { inject, injectable } from "inversify";
import { TYPES } from "../common/ioc/types";
import { Logger } from "../common/logging";
import { Kin } from "../common/blockchain/kin";
import { MessageBroker } from "../common/message_queue/messageBroker";
import { HorizonError } from "@kinecosystem/kin-sdk-node";
import { Metrics } from "../common/metrics/metrics";

@injectable()
export class WalletCreator {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.Metrics) private readonly metrics: Metrics,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.logger = logger;
        this.kin = kin;
        this.messageBroker = messageBroker;
    }

    public async create(request: CreateWalletRequest) {
        this.logger.info("create_wallet_and_callback received", {job: request});

        try {
            await this.kin.createWallet(request.app_id, request.wallet_address);
            this.metrics.walletCreatedSuccessfully(request.app_id);

            const wallet: Wallet = {
                id: request.id,
                kin_balance: 0, // we always create wallets with 0 balance, spare a call to blockchain and assume 0
                // balance
                native_balance: 0,
                wallet_address: request.wallet_address
            };
            this.logger.info("wallet created successfully", {public_address: request.wallet_address});
            await this.messageBroker.enqueueWalletCreatedCallback(request, wallet);
        } catch (e) {
            if (e instanceof HorizonError && e.type == "AccountExistsError") {
                this.metrics.walletExists(request.app_id);
                this.logger.info("wallet already exists - ok", {public_address: request.wallet_address});
                await this.messageBroker.enqueueWalletFailedCallback(request, "account exists");
                this.metrics.callbackEnqueued(request.app_id, "wallet", "success", "create");
            } else {
                this.metrics.walletCreationFailed(request.app_id);
                this.logger.info("wallet creation failed", {public_address: request.wallet_address, error: e});
                await this.messageBroker.enqueueWalletFailedCallback(request, e.message);
                this.metrics.callbackEnqueued(request.app_id, "wallet", "fail", "create");
            }
        }

    }
}