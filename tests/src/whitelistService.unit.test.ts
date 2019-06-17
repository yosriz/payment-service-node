import { WhitelistService } from "../../src/web_api/services/whitelistService";
import { Kin } from "../../src/common/blockchain/kin";
import { Environment, KinClient } from "@kinecosystem/kin-sdk-node";
import { TransactionMismatchError } from "../../src/common/errors";


describe("WhitelistService.whitelistTransaction()", () => {
    let service: WhitelistService;
    const seed = "SCDUHIXV2KDFMGHFNINQB3VOXSKB4EYKR444OZVT72MOHFUAATFKGTZS";

    beforeEach(() => {
        const kin = new Kin(new KinClient(Environment.Testnet), seed,
            "test", 1, {
                test: {hot: seed, warm: seed}
            },
            seed);
        service = new WhitelistService(kin);
    });

    test("when valid request should whitelist correctly", () => {
        const whitelistedTransaction = service.whitelistTransaction({
            xdr: "AAAAAK7JDcEVXWE60hbljfF8DDmnEgZju7B3uQFWSD33T6mBAAAAZAAAAAAAAATSAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAADzEtdGVzdC1hMWEyYTNhNAAAAAABAAAAAAAAAAEAAAAAk3N7FUdqajstwKvZj+7qwt2a2XWBr+CV32q5ZGTycpUAAAAAAAAAAAAQyOAAAAAAAAAAAfdPqYEAAABAdMeTB13SepVozTds/lAJbclzAqNhc6aM62w1Hqz2VId/ZDjZdrNT6Znp0jOUt4rQZU4IfEo0AuwJ1G5XvoDvDg==",
            amount: 11,
            destination: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
            source: "GCXMSDOBCVOWCOWSC3SY34L4BQ42OEQGMO53A55ZAFLEQPPXJ6UYD5LO",
            order_id: "a1a2a3a4",
            app_id: "test",
            network_id: Environment.Testnet.passphrase
        });
        // a whitelisted envelope that includes 2 signatures (both the same as the transaction and the whitelist
        // account are the same.
        expect(whitelistedTransaction).toBe("AAAAAK7JDcEVXWE60hbljfF8DDmnEgZju7B3uQFWSD33T6mBAAAAZAAAAAAAAATSAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAADzEtdGVzdC1hMWEyYTNhNAAAAAABAAAAAAAAAAEAAAAAk3N7FUdqajstwKvZj+7qwt2a2XWBr+CV32q5ZGTycpUAAAAAAAAAAAAQyOAAAAAAAAAAAvdPqYEAAABAdMeTB13SepVozTds/lAJbclzAqNhc6aM62w1Hqz2VId/ZDjZdrNT6Znp0jOUt4rQZU4IfEo0AuwJ1G5XvoDvDvdPqYEAAABAdMeTB13SepVozTds/lAJbclzAqNhc6aM62w1Hqz2VId/ZDjZdrNT6Znp0jOUt4rQZU4IfEo0AuwJ1G5XvoDvDg==");
    });

    test("when invalid amount should throw correct error", () => {
        function whitelistFn() {
            service.whitelistTransaction({
                xdr: "AAAAAK7JDcEVXWE60hbljfF8DDmnEgZju7B3uQFWSD33T6mBAAAAZAAAAAAAAATSAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAADzEtdGVzdC1hMWEyYTNhNAAAAAABAAAAAAAAAAEAAAAAk3N7FUdqajstwKvZj+7qwt2a2XWBr+CV32q5ZGTycpUAAAAAAAAAAAAQyOAAAAAAAAAAAfdPqYEAAABAdMeTB13SepVozTds/lAJbclzAqNhc6aM62w1Hqz2VId/ZDjZdrNT6Znp0jOUt4rQZU4IfEo0AuwJ1G5XvoDvDg==",
                amount: 12, // wrong amount should be 11
                destination: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
                source: "GCXMSDOBCVOWCOWSC3SY34L4BQ42OEQGMO53A55ZAFLEQPPXJ6UYD5LO",
                order_id: "a1a2a3a4",
                app_id: "test",
                network_id: Environment.Testnet.passphrase
            });
        }

        expect(whitelistFn).toThrowError(TransactionMismatchError);
        expect(whitelistFn).toThrowError("Amount");
    });

    test("when invalid order_id should throw correct error", () => {
        function whitelistFn() {
            service.whitelistTransaction({
                xdr: "AAAAAK7JDcEVXWE60hbljfF8DDmnEgZju7B3uQFWSD33T6mBAAAAZAAAAAAAAATSAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAADzEtdGVzdC1hMWEyYTNhNAAAAAABAAAAAAAAAAEAAAAAk3N7FUdqajstwKvZj+7qwt2a2XWBr+CV32q5ZGTycpUAAAAAAAAAAAAQyOAAAAAAAAAAAfdPqYEAAABAdMeTB13SepVozTds/lAJbclzAqNhc6aM62w1Hqz2VId/ZDjZdrNT6Znp0jOUt4rQZU4IfEo0AuwJ1G5XvoDvDg==",
                amount: 12,
                destination: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
                source: "GCXMSDOBCVOWCOWSC3SY34L4BQ42OEQGMO53A55ZAFLEQPPXJ6UYD5LO",
                order_id: "a1a2a3a",
                app_id: "test",
                network_id: Environment.Testnet.passphrase
            });
        }

        expect(whitelistFn).toThrowError(TransactionMismatchError);
        expect(whitelistFn).toThrowError("Order id");
    });

});
