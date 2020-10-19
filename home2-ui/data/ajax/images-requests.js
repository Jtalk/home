import api, {superagent} from "./superagent-api";

export async function load(page) {
    console.debug(`Images (page=${page} loading`);
    let requestBuilder = (await superagent()).get("/images");
    if (page) {
        requestBuilder.query({page: page});
    }
    let response = await requestBuilder.use(api);
    console.debug(`Images loaded (page=${page}) with`, response.status, response.body);
    return response.body
}

export async function upload(description, file) {
    console.info(`Image uploading`, description);
    let requestBuilder = (await superagent()).post("/images");
    requestBuilder.attach(description, file);
    requestBuilder.query({description});
    let response = await requestBuilder.use(api);
    console.info(`Image '${description}' uploaded with`, response.status, response.body);
    return response.body;
}

export async function delete_(id) {
    console.info(`Image ${id} deleting`);
    let response = await (await superagent()).delete(`/images/${id}`)
        .use(api);
    console.info(`Image '${id}' deleted with`, response.status, response.body);
    return response.body;
}

const ImageRequests = {load, upload, delete: delete_};
export default ImageRequests;
