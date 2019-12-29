import {sleep} from "sleepjs";
import config from "react-global-configuration";

export async function apiDelay() {
    let delay = config.get("apiDelay");
    if (delay) {
        await sleep(delay.milliseconds());
    }
}