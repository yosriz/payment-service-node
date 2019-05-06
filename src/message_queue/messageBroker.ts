import {WalletRoute} from "../walletRoute";
import CreateWalletRequest = WalletRoute.CreateWalletRequest;

export interface MessageBroker {
    enqueueCreateWallet(request: CreateWalletRequest): void;
}
