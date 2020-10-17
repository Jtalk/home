import * as request from "superagent";
import api from "./superagent-api";

export class ImagesRequests {

    async load(page) {
        console.debug(`Images (page=${page} loading`);
        let requestBuilder = request.get("/images");
        if (page) {
            requestBuilder.query({page: page});
        }
        let response = await requestBuilder.use(api);
        console.debug(`Images loaded (page=${page}) with`, response.status, response.body);
        return response.body
    }

    async upload(description, file) {
        console.info(`Image uploading`, description);
        let requestBuilder = request.post("/images");
        requestBuilder.attach(description, file);
        requestBuilder.query({description});
        let response = await requestBuilder.use(api);
        console.info(`Image '${description}' uploaded with`, response.status, response.body);
        return response.body;
    }

    async delete(id) {
        console.info(`Image ${id} deleting`);
        let response = await request.delete(`/images/${id}`)
            .use(api);
        console.info(`Image '${id}' deleted with`, response.status, response.body);
        return response.body;
    }

}