import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { _ } from "underscore";
import { Database } from "../../src/db/database";
import { WatcherService } from "../../src/services/watcherService";
import { Logger } from "../../src/logging";
import { Watcher } from "../../src/message_queue/watcher";


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

        const payment = await service.addWatcher("1234", "http://mycallback", ["1", "2"], "aebcfgdhe");
    });

});
