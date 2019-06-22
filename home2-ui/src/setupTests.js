import * as Enzyme from "enzyme/build";
import Adapter from "enzyme-adapter-react-16/build";
import * as config from "react-global-configuration";
import * as logger from "./utils/logger";

Enzyme.configure({adapter: new Adapter()});

config.set({}, {freeze: false});
logger.setDefaultHandler(logger.consoleHandler);
