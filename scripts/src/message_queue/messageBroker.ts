import { CreateWalletRequest } from "../models";

export interface MessageBroker {
    enqueueCreateWallet(request: CreateWalletRequest): void;
}
