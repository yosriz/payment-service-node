export interface Metrics {
    paymentObserved(amount: number, appId: string, address: string): void;

    watcherBeatFailed(e: any): void;

    walletExists(app_id: string): void;

    walletCreationFailed(app_id: string): void;

    walletCreatedSuccessfully(app_id: string): void;

    paymentSent(app_id: string, amount: number): void;

    paymentFailedFailed(app_id: string): void;

    walletCreationEnqueued(appId: String): void;

    watcherBeat(timeSpan: number): void;

    watcherCursor(cursor: number): void;

    callbackEnqueued(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void;

    callbackCalledSuccessfully(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void;

    callbackCallFailed(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void;
}
