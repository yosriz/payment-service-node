import { Metrics } from "./metrics";
import { StatsD } from "hot-shots";

export class StatsDMetrics implements Metrics {
    constructor(private readonly statsd: StatsD) {
        this.statsd = statsd;
    }

    walletCreationEnqueued(appId: string): void {
        this.statsd.increment("wallet_creation.enqueue", 1, {app_id: appId});
    }

    watcherCursor(cursor: number) {
        this.statsd.gauge("watcher_beat.cursor", cursor);
    }

    watcherBeat(timeSpan: number) {
        this.statsd.timing("watcher_beat", timeSpan);
    }

    paymentObserved(amount: number, appId: string, address: string): void {
        this.incrementAndCount("payment_observed",
            amount,
            {
                app_id: appId,
                address: address
            });
    }

    watcherBeatFailed(e: any): void {
        this.statsd.increment("watcher_beat.failed", {error: e});
    }

    private incrementAndCount(metric: string, value: number, tags: any) {
        this.statsd.increment(metric, value, tags);
        this.statsd.increment(`${metric}.count`, tags);
    }

    walletExists(appId: string): void {
        this.statsd.increment("wallet.exists", {app_id: appId});
    }

    walletCreationFailed(app_id: string): void {
        this.statsd.increment("wallet.failed", {app_id: app_id});
    }

    walletCreatedSuccessfully(app_id: string): void {
        this.statsd.increment("wallet.created", {app_id: app_id});
    }

    paymentSent(appId: string, amount: number): void {
        this.incrementAndCount("transaction.paid", amount, {app_id: appId});
    }

    paymentFailedFailed(app_id: string): void {
        this.statsd.increment("transaction.failed", {app_id: app_id});
    }

    callbackEnqueued(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void {
        this.incrementCallback("callback.enqueue", appId, object, state, action);
    }

    callbackCalledSuccessfully(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void {
        this.incrementCallback("callback.success", appId, object, state, action);
    }

    callbackCallFailed(appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create"): void {
        this.incrementCallback("callback.failed", appId, object, state, action);
    }

    private incrementCallback(statName: string, appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create") {
        this.statsd.increment(statName,
            {
                app_id: appId,
                object: object,
                state: state,
                action: action
            });
    }
}
