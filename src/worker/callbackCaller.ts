import { AxiosInstance } from "axios";
import { inject, injectable } from "inversify";
import { TYPES } from "../common/ioc/types";
import { Logger } from "../common/logging";
import { Metrics } from "../common/metrics/metrics";

@injectable()
export class CallbackCaller {

    constructor(@inject(TYPES.Axios) private readonly axios: AxiosInstance,
                @inject(TYPES.Logger) private readonly logger: Logger,
                @inject(TYPES.Metrics) private readonly metrics: Metrics) {
        this.axios = axios;
    }

    public async call(callback: string, appId: string, object: "payment" | "wallet", state: "success" | "fail", action: "send" | "receive" | "create", value: any) {
        const payload = {
            object: object,
            state: state,
            action: action,
            value: value,
        };

        try {
            const response = await this.axios.post(callback, payload);
            this.logger.info("callback response", {response: response.data, payload: payload});
            this.metrics.callbackCalledSuccessfully(appId, object, state, action);
        } catch (e) {
            this.logger.error("callback failed", {error: e, payload: payload});
            this.metrics.callbackCallFailed(appId, object, state, action);
        }
    }
}