import {inject, injectable} from "inversify";
import {TYPES} from "../ioc/types";
import {Database} from "../db/database";
import {Logger} from "../logging";
import {WhitelistRequest} from "../models";
import {Kin} from "../blockchain/kin";
import {KinAccount} from "@kinecosystem/kin-sdk-node";
import {NoSuchServiceError} from "../errors";

@injectable()
export class WhitelistService {

    constructor(@inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.Database) private readonly db: Database,
                @inject(TYPES.Kin) private readonly kin: Kin) {
        this.logger = logger;
        this.kin = kin;
        this.db = db;
    }

    async whitelistTransaction(request: WhitelistRequest): Promise<string> {
        const transaction = this.kin.decodeTransaction(request.xdr, request.network_id);

        const kinAccount = this.kin.appsAccounts.get(request.app_id);
        if (!kinAccount) {
            throw new NoSuchServiceError(`Cant find app id: ${request.app_id}`);
        }
        return kinAccount.whitelistTransaction(request.xdr);
    }

}
