import {injectable} from "inversify";
import {WalletRoute} from "../walletRoute";
import CreateWalletRequest = WalletRoute.CreateWalletRequest;

export interface MessageBroker {
    queueCreateWallet(request: CreateWalletRequest): void;
}

@injectable()
export class RabbitMQBroker implements MessageBroker {

    queueCreateWallet(request: WalletRoute.CreateWalletRequest): void {
    }

}
