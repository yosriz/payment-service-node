import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { WhitelistRequest } from "../models";
import { Kin } from "../blockchain/kin";
import { NetworkMismatchedError } from "@kinecosystem/kin-sdk-node";
import { NoSuchServiceError, TransactionMismatchError } from "../errors";
import { Operation } from "@kinecosystem/kin-sdk-node/node_modules/@kinecosystem/kin-base";
import { Transaction as BaseSdkTransaction } from "@kinecosystem/kin-sdk-node/node_modules/@kinecosystem/kin-sdk";

@injectable()
export class WhitelistService {

    constructor(@inject(TYPES.Kin) private readonly kin: Kin) {
        this.kin = kin;
    }

    whitelistTransaction(request: WhitelistRequest): string {
        let transaction;
        try {
            transaction = this.kin.decodeTransaction(request.xdr, request.network_id);
        } catch (e) {
            if (e instanceof NetworkMismatchedError) {
                throw new TransactionMismatchError("Network id mismatch");
            } else {
                throw new TransactionMismatchError("Transaction could not be decoded");
            }
        }
        this.verifyTransaction(transaction, request);

        const kinAccount = this.kin.appsAccounts.get(request.app_id);
        if (!kinAccount) {
            throw new NoSuchServiceError(`Cant find app id: ${request.app_id}`);
        }
        return kinAccount.whitelistTransaction({envelope: request.xdr, networkId: request.network_id});
    }

    private verifyTransaction(transaction: BaseSdkTransaction, request: WhitelistRequest) {
        if (transaction.memo.type !== "text") {
            throw new TransactionMismatchError("Unexpected memo");
        }
        let version, appId, paymentId;
        if (transaction.memo.value) {
            [version, appId, paymentId] = transaction.memo.value.toString().split("-");
        }
        const op = transaction.operations[0] as Operation.Payment;
        this.compareParams("App id", appId, request.app_id);
        this.compareParams("Order id", paymentId, request.order_id);
        this.compareParams("Source account", op.source ? op.source : transaction.source, request.source);
        this.compareParams("Destination account", op.destination, request.destination);
        this.compareParams("Amount", op.amount, request.amount.toString());
    }

    private compareParams(paramName: string, param1?: string | number, param2?: string | number) {
        if (param1 !== param2) {
            throw new TransactionMismatchError(`${paramName}: ${param1} does not match expected ${paramName}: ${param2}`);
        }
    }

}
