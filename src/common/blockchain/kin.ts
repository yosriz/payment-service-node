import { injectable } from "inversify";
import {
    AccountData,
    Channels,
    KinAccount,
    KinClient,
    NetworkMismatchedError,
    PaymentTransaction,
    Transaction
} from "@kinecosystem/kin-sdk-node";
import { Network, Server, Transaction as BaseSdkTransaction } from "@kinecosystem/kin-sdk";
import { TransactionRetriever } from "@kinecosystem/kin-sdk-node/scripts/bin/blockchain/transactionRetriever";
import { NoSuchServiceError } from "../errors";
import { AppSeeds, Payment, PaymentRequest } from "../models";

@injectable()
export class Kin {
    private readonly accounts: ReadonlyMap<string, AppWallets>;
    private readonly rootAccount: KinAccount;
    private minFee?: number;

    constructor(private readonly kinClient: KinClient, channelsSeed: string, channelsSalt: string, channelsCount: number
        , appSeeds: AppSeeds, rootWallet: string) {
        this.kinClient = kinClient;
        let channelsSeeds = undefined;
        if (channelsSeed && channelsSalt && channelsCount) {
            channelsSeeds = Channels.generateSeeds({
                baseSeed: channelsSeed,
                salt: channelsSalt,
                channelsCount: channelsCount
            }).map(keyPair => keyPair.seed);
        }
        const accountsByAppId = new Map<string, AppWallets>();
        for (const appId in appSeeds) {
            accountsByAppId.set(appId, {
                hot: this.kinClient.createKinAccount({
                    appId: appId,
                    seed: appSeeds[appId].hot,
                    channelSecretKeys: channelsSeeds
                }),
                warm: this.kinClient.createKinAccount({
                    appId: appId,
                    seed: appSeeds[appId].warm,
                    channelSecretKeys: channelsSeeds
                })
            });
        }
        this.rootAccount = this.kinClient.createKinAccount({
            seed: rootWallet,
            channelSecretKeys: channelsSeeds
        });
        this.accounts = accountsByAppId;
    }

    public get appsAccounts(): ReadonlyMap<string, AppWallets> {
        return this.accounts;
    }

    public async getAccountData(account: string): Promise<AccountData> {
        return this.kinClient.getAccountData(account);
    }

    public async getPaymentTransactions(account: string): Promise<PaymentTransaction[]> {
        const transactions: Transaction[] = await this.kinClient.getTransactionHistory({
            limit: 100,
            order: "desc",
            address: account,
        });
        return transactions.filter(tx => tx.type == 'PaymentTransaction') as PaymentTransaction[];
    }

    public async getLatestPaymentTransactions(addresses: string[], cursor: string | null)
        : Promise<{ payments: { tx: PaymentTransaction, watchedAddress: string }[], pagingToken?: string }> {
        const txs = await ((this.kinClient as any)._server as Server).transactions()
            .limit(100)
            .cursor(cursor ? cursor : "now")
            .order("desc")
            .call();

        const transactions = [];
        let pagingToken;
        for (const tx of txs.records) {
            const transaction = TransactionRetriever.fromStellarTransaction(tx);
            if (transaction.type == "PaymentTransaction") {
                let address;
                if (addresses.includes(transaction.source)) {
                    address = transaction.source;
                } else if (addresses.includes(transaction.destination)) {
                    address = transaction.destination;
                }
                if (address) {
                    transactions.push({tx: transaction, watchedAddress: address});
                }
                pagingToken = tx.paging_token;
            }
        }
        return {payments: transactions, pagingToken: pagingToken};
    }

    public decodeTransaction(txEnvelope: string, networkId: string): BaseSdkTransaction {
        const networkPassphrase = Network.current().networkPassphrase();
        if (networkPassphrase !== networkId) {
            throw new NetworkMismatchedError();
        }
        return new BaseSdkTransaction(txEnvelope);
    }

    public async createWallet(appId: string, walletAddress: string): Promise<string> {
        const appWallet = this.accounts.get(appId) ? this.accounts.get(appId)!!.hot : undefined;
        if (!appWallet) {
            throw new NoSuchServiceError("no wallet found for app id: " + appId);
        }

        return await appWallet.channelsPool!!.acquireChannel(async channel => {
            const builder = await appWallet.buildCreateAccount({
                address: walletAddress,
                startingBalance: 0,
                fee: await this.getMinimumFee(),
                channel: channel
            });
            return await appWallet.submitTransaction(builder);
        });
    }

    public async pay(request: PaymentRequest): Promise<Payment> {
        let wallet: KinAccount;
        if (request.is_external) {
            const appWallets = this.accounts.get(request.app_id);
            if (!appWallets) {
                throw new NoSuchServiceError("no wallet found for app id: " + request.app_id);
            }
            wallet = appWallets.hot.publicAddress === request.sender_address ? appWallets.hot : appWallets.warm;
        } else {
            wallet = this.rootAccount;
        }
        const txId = await wallet.channelsPool!!.acquireChannel(async channel => {
            const builder = await wallet.buildSendKin({
                address: request.recipient_address,
                amount: request.amount,
                fee: await this.getMinimumFee(),
                memoText: request.id,
                channel: channel
            });
            return await wallet.submitTransaction(builder);
        });

        return <Payment>{
            recipient_address: request.recipient_address,
            amount: request.amount,
            sender_address: wallet.publicAddress,
            transaction_id: txId,
            app_id: request.app_id,
            id: request.id,
            timestamp: "" // timestamp cannot be extracted without reaching blockchain, do it only when payment is
            // being query from the outside world (web-api) in order to spare call to blockchain each payment
        };
    }

    private async getMinimumFee() {
        if (!this.minFee) {
            this.minFee = await this.kinClient.getMinimumFee();
        }
        return this.minFee;
    }

}

export interface AppWallets {
    hot: KinAccount; // out internal wallet
    warm: KinAccount; // joined wallet, multi sig account controlled by app and us
}
