import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";

export class FooterRequests {

    async load() {
        let response = await request.get("/footer")
            .use(api);
        await apiDelay();
        return response.body
    }

    async update(footer) {
        let response = await request.put("/footer", footer)
            .use(api);
        await apiDelay();
        return response.body;
    }
}