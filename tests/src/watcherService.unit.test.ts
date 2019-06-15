import {Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {Database} from "../../src/common/db/database";
import {WatcherService} from "../../src/web_api/services/watcherService";
import {Logger} from "../../src/common/logging";
import {Watcher} from "../../src/common/message_queue/watcher";


describe("WatcherService", () => {
    let mockLogger: SubstituteOf<Logger>;
    let mockDatabase: SubstituteOf<Database>;
    let mockWatcher: SubstituteOf<Watcher>;
    let service: WatcherService;
    const paymentId = "1234";

    beforeEach(() => {
        mockLogger = Substitute.for<Logger>();
        mockDatabase = Substitute.for<Database>();
        mockWatcher = Substitute.for<Watcher>();
        service = new WatcherService(mockLogger, mockDatabase, mockWatcher);
    });

    test("when payment exists getPayment should return payment", async () => {
        mockDatabase.doesServiceExists("1234").returns(Promise.resolve(true));

        const payment = await service.addWatcher("1234", "http://mycallback",
            ["1", "2"], "aebcfgdhe");
    });

});
