import { Logger } from "../../src/logging";
import { WalletService } from "../../src/services/WalletService";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { MessageBroker } from "../../src/message_queue/messageBroker";
import { Metrics } from "../../src/metrics/metrics";
import { _ } from "underscore";
import { Kin } from "../../src/blockchain/kin";
import { ResourceNotFoundError } from "@kinecosystem/kin-sdk-node/scripts/bin/errors";
import { WalletNotFoundError } from "../../src/errors";
import { PaymentTransaction } from "@kinecosystem/kin-sdk-node";
import { Payment } from "../../src/models";


describe("WalletService", () => {
    const mockLogger = Substitute.for<Logger>();
    const mockMessageBroker = Substitute.for<MessageBroker>();
    const mockMetrics = Substitute.for<Metrics>();
    const mockKin: SubstituteOf<Kin> = Substitute.for<Kin>();
    let route: WalletService;

    beforeEach(() => {
        route = new WalletService(mockLogger, mockMessageBroker, mockMetrics, mockKin);
    });

    test("when createWallet should enqueue create request", () => {
        const wallet = {
            id: "2",
            app_id: "test",
            wallet_address: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
            callback: "http://webhook"
        };
        route.createWallet(wallet);

        mockMessageBroker.received().enqueueCreateWallet(Arg.is(x => _.isEqual(x, wallet)));
    });

    test("when getWallet and wallet exists should return wallet details", async () => {
        const walletAddress = "GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ";
        mockKin.getAccountData(walletAddress).returns({
            id: walletAddress,
            accountId: walletAddress,
                sequenceNumber: 1499647960940544,
                pagingToken: '',
                subentryCount: 0,
                thresholds: {highThreshold: 0, medThreshold: 0, lowThreshold: 0},
                signers:
                    [{
                        publicKey: walletAddress,
                        weight: 1
                    }],
                data: {},
                balances:
                    [{
                        assetType: 'native',
                        balance: 10000,
                        assetCode: undefined,
                        assetIssuer: undefined,
                        limit: undefined
                    }],
                flags: {authRequired: false, authRevocable: false}
            });
        const wallet = await route.getWallet(walletAddress);
        expect(wallet.wallet_address).toBe(walletAddress);
            expect(wallet.native_balance).toBe(10_000);
            expect(wallet.kin_balance).toBe(10_000);
            expect(wallet.id).toBeUndefined();

        }
    );

    test("when getWallet and wallet don't exists should raise an error", async () => {
        mockKin.getAccountData(Arg.any()).mimicks(() => {
            throw new ResourceNotFoundError({type: '', status: 404, title: ''});
        });
        const walletAddress = "some_non_existing_wallet_address";
        await expect(route.getWallet(walletAddress))
            .rejects.toEqual(new WalletNotFoundError(walletAddress));

    });

    test("when getWalletPayments and wallet exists should return payments", async () => {
        const walletAddress = "GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ";
        const destination = "GDXY3YWJXDIC2WOND6WVLQ7NP4VZAZ6MJCB4DNXUWN2GLGG3VK2ZX5TB";
        mockKin.getPaymentTransactions(Arg.any()).returns(Promise.resolve([
                {
                    type: "PaymentTransaction",
                    hash: "some_hash1",
                    timestamp: "2019-03-03T18:23:59Z",
                    destination: destination,
                    source: walletAddress,
                    amount: 10,
                    memo: "1-test-1234567",
                    sequence: 123,
                    fee: 100
                } as PaymentTransaction,
                {
                    type: "PaymentTransaction",
                    hash: "some_hash2",
                    timestamp: "2019-04-03T13:09:49Z",
                    destination: destination,
                    source: walletAddress,
                    amount: 12.3,
                    memo: "1-test-1234568",
                    sequence: 124,
                    fee: 100
                } as PaymentTransaction,
            ]
        ));

        const payments = await route.getWalletPayments(walletAddress);
        expect(payments.length).toBe(2);
        expect(payments[0]).toEqual({
            transaction_id: "some_hash1",
            timestamp: "2019-03-03T18:23:59Z",
            recipient_address: destination,
            sender_address: walletAddress,
            amount: 10,
            app_id: "test",
            id: "1234567"
        } as Payment);
        expect(payments[1]).toEqual({
            transaction_id: "some_hash2",
            timestamp: "2019-04-03T13:09:49Z",
            recipient_address: destination,
            sender_address: walletAddress,
            amount: 12.3,
            app_id: "test",
            id: "1234568"
        } as Payment);
    });

    test("when getWalletPayments and wallet doesn't exists should throw error", async () => {
        mockKin.getPaymentTransactions(Arg.any()).mimicks(() => {
            throw new ResourceNotFoundError({type: '', status: 404, title: ''});
        });

        const walletAddress = "some_non_existing_wallet_address";
        await expect(route.getWalletPayments(walletAddress))
            .rejects.toEqual(new WalletNotFoundError(walletAddress));
    });

});
