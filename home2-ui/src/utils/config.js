import config from "react-global-configuration";
import * as Duration from "duration-js";

let API = process.env["REACT_APP_API_URL"] || "http://localhost:8090";
let DELAY = Duration.parse(process.env["REACT_APP_TEST_DURATION"] || "0s")

console.info("API server is set to", API);
console.info("API response delay is set to", DELAY);

config.set({
    api: API,
    apiDelay: DELAY,
    image: {
        url: {
            template: `${API}/images/{}`
        }
    }
});