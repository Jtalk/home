import * as config from "react-global-configuration";
import * as Duration from "duration-js";

let API = "http://localhost:8090";

config.set({
    api: API,
    apiDelay: Duration.parse("3s"),
    image: {
        url: {
            template: `${API}/images/{}`
        }
    }
});