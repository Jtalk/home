import api, {superagent} from "./superagent-api";

export async function load() {
    console.debug(`Footer loading`);
    let response = await (await superagent()).get("/footer")
        .use(api);
    console.debug(`Footer loaded with`, response.status, response.body);
    return response.body
}

export async function update(footer) {
    console.info(`Footer updating`, footer);
    let response = await (await superagent()).put("/footer", footer)
        .use(api);
    console.info(`Footer updated with`, response.status, response.body);
    return response.body;
}

const FooterRequests = {load, update}
export default FooterRequests;
