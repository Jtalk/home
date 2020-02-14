import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";
import _ from "lodash";

export class ArticlesRequests {

    async load(page, pageSize) {
        let response = await request.get(`/blog/articles?page=${page}&pageSize=${pageSize}`)
            .use(api);
        await apiDelay();
        return _.mapKeys(response.body, (v, k) => k === "data" ? "articles" : k);
    }

    async update(id, update) {
        let response = await request.put(`/blog/articles/${id}`, update)
            .use(api);
        console.info(`Article ${id} updated with ${response.status}: ${response.text}`);
        return response.body;
    }

    async remove(id) {
        await request.delete(`/blog/articles/${id}`)
            .use(api);
        await apiDelay();
    }
}