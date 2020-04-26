import * as request from "superagent";
import api from "./superagent-api";

export class TagsRequests {

    async load() {
        let response = await request.get("/blog/tags")
            .use(api);
        return response.body;
    }
}
