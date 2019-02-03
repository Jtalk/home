import * as config from "react-global-configuration";
import * as Duration from "duration-js";

config.set({
    api: "http://localhost:8090",
    apiDelay: new Duration("3s")
});