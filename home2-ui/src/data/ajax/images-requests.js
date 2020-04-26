import * as request from "superagent";
import api from "../../utils/superagent-api";

export class ImagesRequests {

    async load(page) {
        let requestBuilder = request.get("/images");
        if (page) {
            requestBuilder.query({page: page});
        }
        let response = await requestBuilder.use(api);
        return response.body
    }

    async upload(description, file) {
        let requestBuilder = request.post("/images");
        requestBuilder.attach(description, file);
        requestBuilder.query({description});
        return await requestBuilder.use(api);
    }

    async delete(id) {
        await request.delete(`/images/${id}`)
            .use(api);
    }

}