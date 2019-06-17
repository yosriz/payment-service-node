/* tslint:disable:no-null-keyword */
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { MessageBroker } from "../../src/common/message_queue/messageBroker";
import { Database } from "../../src/common/db/database";
import { Kin } from "../../src/common/blockchain/kin";
import { Logger } from "../../src/common/logging";
import { WatcherProcessor } from "../../src/watcher/watcherProcessor";
import { Metrics } from "../../src/common/metrics/metrics";
import { PaymentTransaction } from "@kinecosystem/kin-sdk-node";
import { Payment } from "../../src/common/models";
import _ = require("underscore");

describe("WatcherProcessor", () => {

    let mockMessageBroker: SubstituteOf<MessageBroker>;
    let mockDatabase: SubstituteOf<Database>;
    let mockMetrics: SubstituteOf<Metrics>;
    let mockKin: SubstituteOf<Kin>;
    let mockLogger: SubstituteOf<Logger>;
    let watcherProcessor: WatcherProcessor;
    const watchedAddress = "GDAVCZIOYRGV74ROE344CMRLPZYSZVRHNTRFGOUSAQBILJ7M5ES25KOZ";
    const watchedAddress2 = "GBISNNCA6ORYSHP5XWJ5F56HG6AKSBUQ6SVEOGYKTUYOZJPMH7EO2R2Z";

    beforeEach(() => {
        mockMessageBroker = Substitute.for<MessageBroker>();
        mockDatabase = Substitute.for<Database>();
        mockMetrics = Substitute.for<Metrics>();
        mockKin = Substitute.for<Kin>();
        mockLogger = Substitute.for<Logger>();

        watcherProcessor = new WatcherProcessor(mockLogger, mockMessageBroker, mockMetrics, mockDatabase, mockKin);
    });

    test("when watched address payment, should enqueue and save cursor", async () => {
        const expectedPagingToken = "192745489589";
        const expectedServiceId = "my_service_id";
        const expectedUrl = "my_service_url";
        mockDatabase.getCursor().returns(Promise.resolve(null));
        mockDatabase.getAllWatchedAddresses().returns(Promise.resolve([watchedAddress, watchedAddress2]));
        mockDatabase.getServicesByWatchedAddress(watchedAddress).returns(Promise.resolve([expectedServiceId]));
        mockDatabase.getService(expectedServiceId).returns(Promise.resolve(expectedUrl));
        mockKin.getLatestPaymentTransactions(Arg.is(val => _.isEqual(val, [watchedAddress, watchedAddress2])), null)
            .returns(Promise.resolve({
                payments: [{
                    tx: <PaymentTransaction>{
                        signatures: [],
                        fee: 100,
                        sequence: 123,
                        memo: "1-test-order_id",
                        amount: 12,
                        source: watchedAddress,
                        destination: "GAQTQNPXL6PIYY4ADKODSKF3OK6PNDEUU54FHE73XTEBAYH5AZTKBV25",
                        timestamp: "2019-06-11T00:45:02Z",
                        hash: "c8815d8d64cad089973f453d0cc8793824c801a13c3a77f5bcc9822d6ca362e8",
                        type: "PaymentTransaction"
                    },
                    watchedAddress: watchedAddress
                }],
                pagingToken: expectedPagingToken
            }));
        await watcherProcessor.processPayments();
        mockDatabase.received().saveCursor(expectedPagingToken);
        mockMetrics.received().paymentObserved(Arg.any(), Arg.any(), Arg.any());
        mockMetrics.received().watcherBeat(Arg.any());
        mockMetrics.received().watcherCursor(192745489589);
        mockMessageBroker.received().enqueuePaymentCallback(expectedUrl, "test", "send", Arg.is(val => _.isEqual(val, <Payment>{
            id: "order_id",
            app_id: "test",
            transaction_id: "c8815d8d64cad089973f453d0cc8793824c801a13c3a77f5bcc9822d6ca362e8",
            timestamp: "2019-06-11T00:45:02Z",
            recipient_address: "GAQTQNPXL6PIYY4ADKODSKF3OK6PNDEUU54FHE73XTEBAYH5AZTKBV25",
            sender_address: watchedAddress,
            amount: 12
        })));
    });
});