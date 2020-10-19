import api, {superagent} from "./superagent-api";

export async function search(query, maxResults = 10) {
    console.debug(`Running search for ${query} with ${maxResults} max results`);
    let response = await (await superagent()).get("/search")
        .query({q: query, max: maxResults})
        .use(api);
    console.debug(`Search completed with`, response.status, response.body);
    return response.body;
}

const SearchRequests = {search};
export default SearchRequests;
