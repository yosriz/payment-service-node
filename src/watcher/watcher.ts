import {WatcherApp} from "./app";
import {TYPES} from "../common/ioc/types";
import {container} from "./ioc/appModules";

const app = container.get<WatcherApp>(TYPES.WatcherApp);
app.run();
