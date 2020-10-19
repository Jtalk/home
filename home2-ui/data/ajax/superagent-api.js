import prefix from "superagent-prefix";
import {sleep} from "sleepjs";
import getConfig from "next/config";
import Duration from "duration-js";

const {publicRuntimeConfig: config} = getConfig();

export async function superagent() {
    return await import("superagent");
}

export default function api(request) {
    let apiPrefix = config.api.prefix;
    request = request
        .use(prefix(apiPrefix))
        .withCredentials();
    if (isApiDelayEnabled()) {
        request = request.use(delayed);
    }
    return request;
}

function delayed(saRequest) {
    let saThen = saRequest.then.bind(saRequest);
    saRequest.then = (resolve, reject) => {
        saThen(
            v => apiDelay().then(() => resolve(v), reject),
            error => reject(error),
        );
    }
    return saRequest;
}

async function apiDelay() {
    let delay = Duration.parse(config.api.debug.delay);
    if (delay) {
        console.debug("Simulating a loading delay for debug");
        await sleep(delay.milliseconds());
    }
}

function isApiDelayEnabled() {
    let delayValue = Duration.parse(config.api.debug.delay);
    return !!delayValue && !!delayValue.milliseconds();
}
