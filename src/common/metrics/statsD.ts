import {Metrics} from "./metrics";
import {StatsD} from "hot-shots";

export class StatsDMetrics implements Metrics {

    constructor(private readonly statsd: StatsD) {
        this.statsd = statsd;
    }

    walletCreationEnqueued(appId: string): void {
        this.statsd.increment('wallet_creation.enqueue', 1, {app_id: appId});
    }
}
