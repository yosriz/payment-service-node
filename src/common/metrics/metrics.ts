export interface Metrics {

    walletCreationEnqueued(appId: String): void;

    watcherBeat(timeSpan: number): void;

    watcherCursor(cursor: number): void;

    paymentObserved(amount: number, appId: string, address: string): void;

    watcherBeatFailed(e: any): void;
}
