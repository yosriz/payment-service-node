import { Logger } from "../../src/logging";
import { WalletService } from "../../src/services/WalletService";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { MessageBroker } from "../../src/message_queue/messageBroker";
import { Metrics } from "../../src/metrics/metrics";
import { Response } from "express-serve-static-core";
import { _ } from "underscore";
import { Kin } from "../../src/blockchain/kin";
import { ResourceNotFoundError } from "@kinecosystem/kin-sdk-node/scripts/bin/errors";
import { WalletNotFoundError } from "../../src/errors";


describe("WalletService", () => {
    const mockLogger = Substitute.for<Logger>();
    const mockMessageBroker = Substitute.for<MessageBroker>();
    const mockMetrics = Substitute.for<Metrics>();
    const mockKin: SubstituteOf<Kin> = Substitute.for<Kin>();
    let route: WalletService;

    beforeEach(() => {
        route = new WalletService(mockLogger, mockMessageBroker, mockMetrics, mockKin);
    });

    test("create wallet - happy path", () => {
        const wallet = {
            id: "2",
            app_id: "test",
            wallet_address: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
            callback: "http://webhook"
        };
        route.createWallet(wallet);

        mockMessageBroker.received().enqueueCreateWallet(Arg.is(x => _.isEqual(x, wallet)));
    });

    test("wallet found, happy path", async () => {
            mockKin.getAccountData(Arg.any()).returns({
                id: 'GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ',
                accountId: 'GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ',
                sequenceNumber: 1499647960940544,
                pagingToken: '',
                subentryCount: 0,
                thresholds: {highThreshold: 0, medThreshold: 0, lowThreshold: 0},
                signers:
                    [{
                        publicKey: 'GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ',
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
            const wallet = await route.getWallet("GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ");
            expect(wallet.wallet_address).toBe("GBAVLXZUOVTWAULFJ2X4HAHKZPEM7UHHVMTOKQIDMSIGWSN27V6LPHHJ");
            expect(wallet.native_balance).toBe(10_000);
            expect(wallet.kin_balance).toBe(10_000);
            expect(wallet.id).toBeUndefined();

        }
    );

    test("wallet not found, expect error", async () => {
        const mockResponse = Substitute.for<Response>();
        mockKin.getAccountData(Arg.any()).mimicks(() => {
            throw new ResourceNotFoundError({type: '', status: 404, title: ''});
        });
        const walletAddress = "some_non_existing_wallet_address";
        await expect(route.getWallet(walletAddress))
            .rejects.toEqual(new WalletNotFoundError(walletAddress));

    });

});
