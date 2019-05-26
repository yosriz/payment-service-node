import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { Logger } from "../logging";
import { MessageBroker } from "../message_queue/messageBroker";
import { Metrics } from "../metrics/metrics";
import { Kin } from "../blockchain/kin";
import { CreateWalletRequest, Payment, Wallet } from "../models";
import { WalletNotFoundError } from "../errors";
import { KinSdkError } from "@kinecosystem/kin-sdk-node";

@injectable()
export class WalletService {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.MessageBroker) private readonly messageBroker: MessageBroker,
                @inject(TYPES.Metrics) private readonly metrics: Metrics,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.logger = logger;
        this.messageBroker = messageBroker;
        this.metrics = metrics;
        this.kin = kin;
    }

    createWallet(walletRequest: CreateWalletRequest) {
        this.metrics.walletCreationEnqueued(walletRequest.app_id);
        this.logger.info(`wallet creation request for app_id : ${walletRequest.app_id}, id : ${walletRequest.id}`);
        this.messageBroker.enqueueCreateWallet(walletRequest);
    }

    async getWallet(walletAddress: string) {
        try {
            const accountData = await this.kin.getAccountData(walletAddress);
            const balance = accountData.balances.filter(balance => balance.assetType === "native")[0].balance;
            return {
                kin_balance: balance,
                native_balance: balance,
                wallet_address: accountData.id
            } as Wallet;
        } catch (e) {
            this.throwWalletNotFoundIfNeeded(e, walletAddress);
        }
    }

    private throwWalletNotFoundIfNeeded(e: any, walletAddress: string): never {
        if ((e as KinSdkError).type === "ResourceNotFoundError") {
            throw new WalletNotFoundError(walletAddress);
        } else {
            throw e;
        }
    }

    async getWalletPayments(walletAddress: string): Promise<Payment[]> {
        try {
            const payments = await this.kin.getPaymentTransactions(walletAddress);
            return payments.map(paymentTx => {
                let version, appId: string, paymentId: string;
                if (paymentTx.memo) {
                    [version, appId, paymentId] = paymentTx.memo.split("-");
                }
                const payment: Payment = {
                    id: paymentId!!,
                    amount: paymentTx.amount,
                    sender_address: paymentTx.source,
                    recipient_address: paymentTx.destination,
                    app_id: appId!!,
                    transaction_id: paymentTx.hash,
                    timestamp: paymentTx.timestamp
                };
                return payment;
            });
        } catch (e) {
            return this.throwWalletNotFoundIfNeeded(e, walletAddress);
        }
    }
}
