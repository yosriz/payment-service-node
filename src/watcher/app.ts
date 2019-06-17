import { Logger } from "../common/logging";
import { WatcherProcessor } from "./watcherProcessor";
import { Metrics } from "../common/metrics/metrics";
import { inject, injectable } from "inversify";
import { TYPES } from "../common/ioc/types";

@injectable()
export class WatcherApp {
    private readonly WATCHER_INTERVAL_MILLIS = 1000;

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.WatcherProcessor) private readonly watcherProcessor: WatcherProcessor,
                @inject(TYPES.Metrics) private readonly metrics: Metrics) {
        this.logger = logger;
        this.watcherProcessor = watcherProcessor;
        this.metrics = metrics;
    }

    public run() {
        this.scheduleWork();
    }

    private scheduleWork() {
        setTimeout(async () => {
                await this.doWork();
            },
            this.WATCHER_INTERVAL_MILLIS);
    }

    private async doWork() {
        try {
            await this.watcherProcessor.processPayments();
        } catch (e) {
            this.metrics.watcherBeatFailed(e);
            this.logger.error("failed watcher iteration", {error: e.toString()});
        } finally {
            this.scheduleWork();
        }

    }
}
