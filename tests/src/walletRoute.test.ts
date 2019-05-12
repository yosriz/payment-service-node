import { Logger } from "../../scripts/src/logging";

describe("Error", async () => {
    test("Network error", async () => {
        /*const route = new WalletRoute(new MockLogger(), {
            enqueueCreateWallet(request: WalletRoute.CreateWalletRequest): void {
            }
        }, {
            walletCreationEnqueued(appId: String): void {
            }
        });*/
    });
});


class MockLogger implements Logger {
    debug(message: string, options?: object): void {
    }

    error(message: string, options?: object): void {
    }

    info(message: string, options?: object): void {
    }

    verbose(message: string, options?: object): void {
    }

    warn(message: string, options?: object): void {
    }

}