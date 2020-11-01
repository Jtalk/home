import prefix from "superagent-prefix";
import getConfig from "next/config";
import {Loading} from "../reduce/global/enums";

const {publicRuntimeConfig: config} = getConfig();

export async function superagent() {
    return await import("superagent");
}

export async function superagentFetch(url) {
    try {
        const sa = await superagent();
        console.debug(`Loading`, url);
        const response = await sa.get(url)
            .use(api);
        console.debug(`Loaded`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error fetching`, url, e);
        throw e;
    }
}

export async function superagentPostJson(url, data, printData = false) {
    try {
        const sa = await superagent();
        console.info(`Posting`, url, printData ? data : "<secret>");
        let response = await sa.post(url, data)
            .use(api);
        console.info(`Post complete`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error posting`, url, e);
        throw e;
    }
}

export async function superagentPostForm(url, data, printData = false) {
    try {
        const sa = await superagent();
        console.info(`Posting`, url, printData ? data : "<secret>");
        let response = await sa.post(url)
            .type("form")
            .send(data)
            .use(api);
        console.info(`Post complete`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error posting`, url, e);
        throw e;
    }
}

export async function superagentPut(url, data) {
    try {
        const sa = await superagent();
        console.info(`Putting`, url, data);
        let response = await sa.put(url, data)
            .use(api);
        console.info(`Put complete`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error putting`, url, e);
        throw e;
    }
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
    if (!config.api.debug.delay) return;
    const Duration = await import("duration-js");
    let delay = Duration.parse(config.api.debug.delay);
    if (delay) {
        console.debug("Simulating a loading delay for debug");
        const sleepjs = await import("sleepjs");
        await sleepjs.sleep(delay.milliseconds());
    }
}

function isApiDelayEnabled() {
    return !!config.api.debug.delay;
}
