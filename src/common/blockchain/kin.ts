import {injectable} from "inversify";
import {
    AccountData,
    Channels,
    KinAccount,
    KinClient,
    NetworkMismatchedError,
    PaymentTransaction,
    Transaction
} from "@kinecosystem/kin-sdk-node";
import {Network, Server, Transaction as BaseSdkTransaction} from "@kinecosystem/kin-sdk";
import {TransactionRetriever} from "@kinecosystem/kin-sdk-node/scripts/bin/blockchain/transactionRetriever";

@injectable()
export class Kin {
    private readonly accounts: ReadonlyMap<string, KinAccount>;

    constructor(private readonly kinClient: KinClient, channelsSeed: string, channelsSalt: string, channelsCount: number
        , appSeeds: AppSeeds) {
        this.kinClient = kinClient;
        let channelsSeeds = undefined;
        if (channelsSeed && channelsSalt && channelsCount) {
            channelsSeeds = Channels.generateSeeds({
                baseSeed: channelsSeed,
                salt: channelsSalt,
                channelsCount: channelsCount
            }).map(keyPair => keyPair.seed);
        }
        const accountsByAppId = new Map<string, KinAccount>();
        for (const appId in appSeeds) {
            accountsByAppId.set(appId, this.kinClient.createKinAccount({
                appId: appId,
                seed: appSeeds[appId],
                channelSecretKeys: channelsSeeds
            }));
        }
        this.accounts = accountsByAppId;
    }

    public get appsAccounts(): ReadonlyMap<string, KinAccount> {
        return this.accounts;
    }

    async getAccountData(account: string): Promise<AccountData> {
        return this.kinClient.getAccountData(account);
    }

    async getPaymentTransactions(account: string): Promise<PaymentTransaction[]> {
        const transactions: Transaction[] = await this.kinClient.getTransactionHistory({
            limit: 100,
            order: "desc",
            address: account,
        });
        return transactions.filter(tx => tx.type == 'PaymentTransaction') as PaymentTransaction[];
    }

    async getLatestPaymentTransactions(addresses: string[], cursor?: string)
        : Promise<{ payments: { tx: PaymentTransaction, watchedAddress: string }[], pagingToken?: string }> {
        let txs = await ((this.kinClient as any)._server as Server).transactions()
            .limit(100)
            .cursor(cursor ? cursor : "now")
            .order('desc')
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
                    pagingToken = tx.paging_token;
                }
            }
        }
        return {payments: transactions, pagingToken: pagingToken};
    }

    decodeTransaction(txEnvelope: string, networkId: string): BaseSdkTransaction {
        const networkPassphrase = Network.current().networkPassphrase();
        if (networkPassphrase !== networkId) {
            throw new NetworkMismatchedError();
        }
        return new BaseSdkTransaction(txEnvelope);
    }

}

export interface AppSeeds {
    [appID: string]: string;
}
