import { inject, injectable } from "inversify";
import { TYPES } from "../../common/ioc/types";
import { WhitelistRequest } from "../../common/models";
import { Kin } from "../../common/blockchain/kin";
import { NetworkMismatchedError } from "@kinecosystem/kin-sdk-node";
import { NoSuchServiceError, TransactionMismatchError } from "../../common/errors";
import { Operation } from "@kinecosystem/kin-base";
import { Transaction as BaseSdkTransaction } from "@kinecosystem/kin-sdk";
import { parseMemo } from "../../common/utils";

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

        const appWallets = this.kin.appsAccounts.get(request.app_id);
        const kinAccount = appWallets!!.hot;
        if (!kinAccount) {
            throw new NoSuchServiceError(`Cant find app id: ${request.app_id}`);
        }
        return kinAccount.whitelistTransaction({envelope: request.xdr, networkId: request.network_id});
    }

    private verifyTransaction(transaction: BaseSdkTransaction, request: WhitelistRequest) {
        if (transaction.memo.type !== "text") {
            throw new TransactionMismatchError("Unexpected memo");
        }
        if (transaction.memo.value) {
            // tslint:disable-next-line:no-var-keyword prefer-const
            var {appId, paymentId} = parseMemo(transaction.memo.value.toString());
        }
        const op = transaction.operations[0] as Operation.Payment;
        this.compareParams("App id", appId!!, request.app_id);
        this.compareParams("Order id", paymentId!!, request.order_id);
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
