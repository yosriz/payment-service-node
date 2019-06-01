import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { MessageBroker } from "../../src/message_queue/messageBroker";
import { _ } from "underscore";
import { Kin } from "../../src/blockchain/kin";
import { Payment, PaymentRequest } from "../../src/models";
import { PaymentService } from "../../src/services/paymentService";
import { Database } from "../../src/db/database";
import { NoSuchServiceError, PaymentAlreadyExistsError, PaymentNotFoundError } from "../../src/errors";
import { KinAccount } from "@kinecosystem/kin-sdk-node";


describe("PaymentService", () => {
    let mockMessageBroker: SubstituteOf<MessageBroker>;
    let mockDatabase: SubstituteOf<Database>;
    let mockKin: SubstituteOf<Kin>;
    let service: PaymentService;
    const paymentId = "1234";
    const expectedPayment = <Payment>{
        id: paymentId,
        app_id: "test",
        transaction_id: "8da527ef4e20d29c88e9a839c444f0e0b8d2563e0ef9367a4fb3e6287eab3a26",
        recipient_address: "GDAVCZIOYRGV74ROE344CMRLPZYSZVRHNTRFGOUSAQBILJ7M5ES25KOZ",
        sender_address: "GDAVCZIOYRGV74ROE344CMRLPZYSZVRHNTRFGOUSAQBILJ7M5ES25KOB",
        amount: 12,
        timestamp: "2019-02-27T23:53:23Z",
    };
    const payRequest = <PaymentRequest>{
        amount: 20,
        app_id: "test",
        callback: "",
        id: paymentId,
        is_external: true,
        recipient_address: "GDAVCZIOYRGV74ROE344CMRLPZYSZVRHNTRFGOUSAQBILJ7M5ES25KOZ",
        sender_address: "GDAVCZIOYRGV74ROE344CMRLPZYSZVRHNTRFGOUSAQBILJ7M5ES25KOB"
    };

    beforeEach(() => {
        mockMessageBroker = Substitute.for<MessageBroker>();
        mockDatabase = Substitute.for<Database>();
        mockKin = Substitute.for<Kin>();
        service = new PaymentService(mockMessageBroker, mockDatabase, mockKin);
    });

    test("when payment exists getPayment should return payment", async () => {
        mockDatabase.getPayment(paymentId).returns(Promise.resolve(expectedPayment));

        const payment = await service.getPayment(paymentId);
        expect(payment).toEqual(expectedPayment);
    });

    test("when payment doesn't exist should throw error", async () => {
        mockDatabase.getPayment(paymentId).returns(Promise.resolve(undefined));

        await expect(service.getPayment(paymentId))
            .rejects.toEqual(new PaymentNotFoundError(paymentId));
    });

    test("when payment doesn't exist and app exists should enqueue payment", async () => {
        mockDatabase.doesPaymentExist(paymentId).returns(Promise.resolve(false));
        mockKin.appsAccounts.returns(new Map([["test", undefined as any]]) as ReadonlyMap<string, KinAccount>);

        await service.pay(payRequest);

        mockMessageBroker.received().enqueueSendPayment(Arg.is(x => _.isEqual(x, payRequest)));
    });

    test("when payment doesn't exist and app doesn't exists but an internal payment should enqueue payment", async () => {
        mockDatabase.doesPaymentExist(paymentId).returns(Promise.resolve(false));
        mockKin.appsAccounts.returns(new Map([["none", undefined as any]]) as ReadonlyMap<string, KinAccount>);

        const internalPayEquest = {...payRequest, is_external: false}; // clone, o.w. will affect other tests
        await service.pay(internalPayEquest);

        mockMessageBroker.received().enqueueSendPayment(Arg.is(x => _.isEqual(x, internalPayEquest)));
    });

    test("when payment doesn't exist and app id doesn't exists should throw error", async () => {
        mockDatabase.doesPaymentExist(paymentId).returns(Promise.resolve(false));
        mockKin.appsAccounts.returns(new Map([["none", undefined as any]]) as ReadonlyMap<string, KinAccount>);

        await expect(service.pay(payRequest))
            .rejects.toEqual(new NoSuchServiceError(payRequest.app_id));
    });

    test("when payment exist should throw error", async () => {
        mockDatabase.doesPaymentExist(paymentId).returns(Promise.resolve(true));

        await expect(service.pay(payRequest))
            .rejects.toEqual(new PaymentAlreadyExistsError());
    });

});
