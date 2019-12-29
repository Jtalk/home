import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";

export class ImagesRequests {

    async load(page) {
        let requestBuilder = request.get("/images");
        if (page) {
            requestBuilder.query({page: page});
        }
        let response = await requestBuilder.use(api);
        await apiDelay();
        return response.body
    }

    async upload(description, file) {
        let requestBuilder = request.post("/images");
        requestBuilder.attach(description, file);
        requestBuilder.query({description});
        let response = await requestBuilder.use(api);
        await apiDelay();
        return response;
    }

    async delete(id) {
        await request.delete(`/images/${id}`)
            .use(api);
        await apiDelay();
    }

}