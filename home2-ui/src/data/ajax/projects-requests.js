import * as request from "superagent";
import api from "../../utils/superagent-api";

export class ProjectsRequests {

    constructor(images) {
        this.images = images;
    }

    async load(publishedOnly) {
        let response = await request.get("/projects")
            .query({published: publishedOnly})
            .use(api);
        return response.body
    }

    async update(id, update, logo) {
        if (logo) {
            update.logoId = await this.uploadLogo(id, logo);
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

    async remove(id) {
        await request.delete(`/projects/${id}`)
            .use(api);
    }
}