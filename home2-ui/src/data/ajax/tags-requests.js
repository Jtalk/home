import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";

export class TagsRequests {

    async load() {
        let response = await request.get("/blog/tags")
            .use(api);
        await apiDelay();
        return response.body;
    }
}
