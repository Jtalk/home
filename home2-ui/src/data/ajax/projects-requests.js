import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";

export class ProjectsRequests {

    constructor(images) {
        this.images = images;
    }

    async load() {
        let response = await request.get("/projects")
            .use(api);
        await apiDelay();
        return response.body
    }

    async update(id, update, logo) {
        if (logo) {
            update.photoId = await this.uploadLogo(id, logo);
        }
        let response = await request.put(`/projects/${id}`, update)
            .use(api);
        console.info(`Project ${id} updated with ${response.status}: ${response.text}`);
        return Object.assign({}, response.body);
    }

    async uploadLogo(id, logo) {
        console.debug("Uploading logo", logo);
        try {
            let response = await this.images.upload(`project-logo-${id}`, logo);
            let body = response.body;
            console.debug(`Logo updated, new logo ID is ${body.id}`);
            return body.id;
        } catch (e) {
            console.error("Exception while uploading a new logo", e);
            throw Error("Cannot upload a new logo")
        }
    }
}