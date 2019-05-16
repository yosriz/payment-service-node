import { Logger } from "../../scripts/src/logging";
import { WalletRoute } from "../../scripts/src/walletRoute";
import { Arg, Substitute } from "@fluffy-spoon/substitute";
import { MessageBroker } from "../../scripts/src/message_queue/messageBroker";
import { Metrics } from "../../scripts/src/metrics/metrics";
import { Request, Response } from "express-serve-static-core";
import { _ } from "underscore";
import CreateWalletRequest = WalletRoute.CreateWalletRequest;


describe("WalletRoute", () => {
    const mockLogger = Substitute.for<Logger>();
    const mockMessageBroker = Substitute.for<MessageBroker>();
    const mockMetrics = Substitute.for<Metrics>();
    let route: WalletRoute;

    beforeEach(() => {
        route = new WalletRoute(mockLogger, mockMessageBroker, mockMetrics);
    });

    test("Happy path", () => {
        const mockResponse = Substitute.for<Response>();
        const walletReq = {
            id: "2",
            app_id: "test",
            wallet_address: "GCJXG6YVI5VGUOZNYCV5TD7O5LBN3GWZOWA27YEV35VLSZDE6JZJKFTQ",
            callback: "http://webhook"
        };
        route.createWalletHandler((walletReq as CreateWalletRequest) as any as Request, mockResponse, undefined);

        mockMessageBroker.received().enqueueCreateWallet(Arg.is(x => _.isEqual(x, walletReq)));
    });

});
