import api, {superagent} from "./api";

export async function superagentUploadFile(url, name, file) {
    try {
        const sa = await superagent();
        console.info(`Uploading`, url);
        let response = await sa.post(url)
            .attach(name, file)
            .query({description: name})
            .use(api);
        console.info(`Upload complete`, url, response.status, response.body);
        return response.body;
    } catch (e) {
        console.error(`Error uploading`, url, e);
        throw e;
    }
}
