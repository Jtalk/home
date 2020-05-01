import * as request from "superagent";
import api from "./superagent-api";

export class SearchRequests {

    async search(query, maxResults = 10) {
        console.debug(`Running search for ${query} with ${maxResults} max results`);
        let response = await request.get("/search")
            .query({q: query, max: maxResults})
            .use(api);
        console.debug(`Search completed with`, response.status, response.body);
        return response.body;
    }
}