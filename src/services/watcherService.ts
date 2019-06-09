import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { NoSuchServiceError } from "../errors";
import { Database } from "../db/database";
import { Watcher } from "../message_queue/watcher";
import { Logger } from "../logging";

@injectable()
export class WatcherService {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Watcher) private readonly watcher: Watcher) {
        this.logger = logger;
        this.watcher = watcher;
        this.db = db;
    }

    async addWatcher(serviceId: string, callbackUrl: string, addresses: string[], orderId: string): Promise<void> {
        if (!await this.db.doesServiceExists(serviceId)) {
            await this.db.addService(serviceId, callbackUrl);
        }
        for (const address of addresses) {
            await this.watcher.add(serviceId, address, orderId);
            this.logger.info(`Added order: ${orderId} to watcher for: ${address}`);
        }
    }

    async deleteWatcher(serviceId: string, address: string, orderId: string): Promise<void> {
        if (!this.db.doesServiceExists(serviceId)) {
            throw new NoSuchServiceError(`There is no watcher for service: ${serviceId}`);
        }
        this.watcher.remove(serviceId, address, orderId);
        this.logger.info(`Removed order: ${orderId} to watcher for: ${address}`);

    }

}
