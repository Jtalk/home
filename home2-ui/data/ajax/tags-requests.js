import api, {superagent} from "./superagent-api";

export async function load() {
    console.debug(`Tags loading`);
    let response = await (await superagent()).get("/blog/tags")
        .use(api);
    console.debug(`Tags loaded with`, response.status, response.body);
    return response.body;
}

const TagRequests = {load};
export default TagRequests;
