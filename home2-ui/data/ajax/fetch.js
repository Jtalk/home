import api, {superagent} from "./api";

export async function superagentFetch(url) {
    try {
        const sa = await superagent();
        console.debug(`Loading`, url);
        const response = await sa.get(url)
            .use(api);
        console.debug(`Loaded`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error fetching`, url, e);
        throw e;
    }
}
