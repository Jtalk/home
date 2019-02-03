import {sleep} from "sleepjs";
import * as config from "react-global-configuration";

export async function apiDelay() {
    await sleep(config.get("apiDelay").milliseconds());
}