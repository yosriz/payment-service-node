import {Kin} from "../../src/common/blockchain/kin";
import {Environment, KinClient} from "@kinecosystem/kin-sdk-node";
import {Operation} from "@kinecosystem/kin-sdk-node/node_modules/@kinecosystem/kin-base";

describe("Kin.decodeTransaction", () => {
    let kin: Kin;

    beforeEach(() => {
        kin = new Kin(new KinClient(Environment.Testnet), "SCDUHIXV2KDFMGHFNINQB3VOXSKB4EYKR444OZVT72MOHFUAATFKGTZS",
            "test", 1, {"test": "SCDUHIXV2KDFMGHFNINQB3VOXSKB4EYKR444OZVT72MOHFUAATFKGTZS"});
    });

    test("when decoding should return correct transaction", () => {
        const transaction = kin.decodeTransaction("AAAAAK7JDcEVXWE60hbljfF8DDmnEgZju7B3uQFWSD33T6mBAAAAZAAAAAAAAATSAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAABG1lbW8AAAABAAAAAAAAAAEAAAAArskNwRVdYTrSFuWN8XwMOacSBmO7sHe5AVZIPfdPqYEAAAAAAAAAAAAST4AAAAAAAAAAAfdPqYEAAABAtJw4pop72Dq3k2PIsQffwb1iCzfGfby15WUMG8grruG3cqXJavY3M5Mas29Mo59ZZU4l7I3sNBkO1HH9mAraAQ==",
            Environment.Testnet.passphrase);

        expect(transaction.source).toBe("GCXMSDOBCVOWCOWSC3SY34L4BQ42OEQGMO53A55ZAFLEQPPXJ6UYD5LO");
        expect(transaction.fee).toBe(100);
        expect(transaction.sequence).toBe("1234");
        expect(transaction.memo).not.toBeNull();
        expect((transaction.memo as any).value.toString()).toBe("memo");
        const op = transaction.operations[0] as Operation.Payment;
        expect(op.amount).toBe("12");

    });
});
