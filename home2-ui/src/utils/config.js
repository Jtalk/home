import config from "react-global-configuration";
import * as Duration from "duration-js";

let API = process.env["REACT_APP_API_URL"] || "http://localhost:8090";
let DEBUG_DELAY = Duration.parse(process.env["REACT_APP_TEST_DURATION"] || "0s")

console.info("API server is set to", API);
console.info("API debug response delay is set to", DEBUG_DELAY);

config.set({
    api: {
        prefix: API,
        debug: {
            delay: DEBUG_DELAY,
        }
    },
    image: {
        url: {
            template: `${API}/images/{}`
        }
    }
});