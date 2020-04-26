import * as request from "superagent";
import api from "./superagent-api";

export class TagsRequests {

    async load() {
        console.debug(`Tags loading`);
        let response = await request.get("/blog/tags")
            .use(api);
        console.debug(`Tags loaded with`, response.status, response.body);
        return response.body;
    }
}
