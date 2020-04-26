import * as request from "superagent";
import api from "./superagent-api";

export class FooterRequests {

    async load() {
        let response = await request.get("/footer")
            .use(api);
        return response.body
    }

    async update(footer) {
        let response = await request.put("/footer", footer)
            .use(api);
        return response.body;
    }
}