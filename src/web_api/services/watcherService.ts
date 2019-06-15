import {inject, injectable} from "inversify";
import {TYPES} from "../ioc/types";
import {NoSuchServiceError} from "../../common/errors";
import {Database} from "../../common/db/database";
import {Logger} from "../../common/logging";

@injectable()
export class WatcherService {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.Database) private readonly db: Database) {
        this.logger = logger;
        this.db = db;
    }

    async addWatcher(serviceId: string, callbackUrl: string, addresses: string[], orderId: string): Promise<void> {
        if (!await this.db.doesServiceExists(serviceId)) {
            await this.db.addService(serviceId, callbackUrl);
        }
        for (const address of addresses) {
            await this.db.addWatcher(serviceId, address, orderId);
            this.logger.info(`Added order: ${orderId} to watcher for: ${address}`);
        }
    }

    async deleteWatcher(serviceId: string, address: string, orderId: string): Promise<void> {
        if (!this.db.doesServiceExists(serviceId)) {
            throw new NoSuchServiceError(`There is no watcher for service: ${serviceId}`);
        }
        await this.db.removeWatcher(serviceId, address, orderId);
        this.logger.info(`Removed order: ${orderId} to watcher for: ${address}`);

    }

}
