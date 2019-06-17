import { container } from "./ioc/appModules";
import { TYPES } from "../common/ioc/types";
import { WorkerApp } from "./app";

const app = container.get<WorkerApp>(TYPES.WorkerApp);
app.run();