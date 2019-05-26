import {injectable} from "inversify";
import {
    AccountData,
    Channels,
    KinAccount,
    KinClient,
    PaymentTransaction,
    Transaction
} from "@kinecosystem/kin-sdk-node";

@injectable()
export class Kin {
    private readonly accounts: ReadonlyMap<string, KinAccount>;

    constructor(private readonly kinClient: KinClient, channelsSeed: string, channelsSalt: string, channelsCount: number
        , appSeeds: AppSeeds) {
        this.kinClient = kinClient;
        const accountsByAppId: any = {};
        let channelsSeeds = undefined;
        if (channelsSeed && channelsSalt && channelsCount) {
            channelsSeeds = Channels.generateSeeds({
                baseSeed: channelsSeed,
                salt: channelsSalt,
                channelsCount: channelsCount
            }).map(keyPair => keyPair.seed);
        }
        for (const appId in appSeeds) {
            accountsByAppId[appId] = this.kinClient.createKinAccount({
                appId: appId,
                seed: appSeeds[appId],
                channelSecretKeys: channelsSeeds
            });
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

}

export interface AppSeeds {
    [appID: string]: string;
}
