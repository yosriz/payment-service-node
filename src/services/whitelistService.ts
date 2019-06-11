import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/types";
import { Database } from "../db/database";
import { Watcher } from "../message_queue/watcher";
import { Logger } from "../logging";
import { WhitelistRequest } from "../models";

@injectable()
export class WhitelistService {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Watcher) private readonly watcher: Watcher) {
        this.logger = logger;
        this.watcher = watcher;
        this.db = db;
    }

    async whitelistTransaction(request: WhitelistRequest): Promise<void> {

    }

}
