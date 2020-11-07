import prefix from "superagent-prefix";
import getConfig from "next/config";
import delay, {isApiDelayEnabled} from "./delay";

const {publicRuntimeConfig: config} = getConfig();

export async function superagent() {
    return await import("superagent");
}

export default function index(request) {
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
            v => delay().then(() => resolve(v), reject),
            error => reject(error),
        );
    }
    return saRequest;
}
