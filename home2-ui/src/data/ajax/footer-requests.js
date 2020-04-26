import * as request from "superagent";
import api from "./superagent-api";

export class FooterRequests {

    async load() {
        console.debug(`Footer loading`);
        let response = await request.get("/footer")
            .use(api);
        console.debug(`Footer loaded with`, response.status, response.body);
        return response.body
    }

    async update(footer) {
        console.info(`Footer updating`, footer);
        let response = await request.put("/footer", footer)
            .use(api);
        console.info(`Footer updated with`, response.status, response.body);
        return response.body;
    }
}