import {Metrics} from "./metrics";
import {StatsD} from "hot-shots";

export class StatsDMetrics implements Metrics {
    constructor(private readonly statsd: StatsD) {
        this.statsd = statsd;
    }

    walletCreationEnqueued(appId: string): void {
        this.statsd.increment('wallet_creation.enqueue', 1, {app_id: appId});
    }

    watcherCursor(cursor: number) {
        this.statsd.gauge("watcher_beat.cursor", cursor);
    }

    watcherBeat(timeSpan: number) {
        this.statsd.timing("watcher_beat", timeSpan);
    }

    paymentObserved(amount: number, appId: string, address: string): void {
        this.statsd.increment("payment_observed",
            amount,
            {
                app_id: appId,
                address: address
            });
    }

    watcherBeatFailed(e: any): void {
        this.statsd.increment('watcher_beat.failed', {error: e});
    }
}
