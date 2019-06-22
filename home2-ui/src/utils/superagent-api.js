import * as config from "react-global-configuration";
import prefix from "superagent-prefix";

export default function api(request) {
    let apiPrefix = config.get("api");
    return request.use(prefix(apiPrefix))
}