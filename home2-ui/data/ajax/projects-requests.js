import * as request from "superagent";
import api from "./superagent-api";

export class ProjectsRequests {

    constructor(images) {
        this.images = images;
    }

    async load(publishedOnly) {
        console.debug(`Projects (published=${publishedOnly} loading`);
        let response = await request.get("/projects")
            .query({published: publishedOnly})
            .use(api);
        console.debug(`Projects (published=${publishedOnly}) loaded with`, response.status, response.body);
        return response.body
    }

    async update(id, update, logo) {
        console.info(`Project ${id} updating`, update);
        if (logo) {
            console.info(`Uploading logo for project ${id}`);
            update.logoId = await this.uploadLogo(id, logo);
        }
        let response = await request.put(`/projects/${id}`, update)
            .use(api);
        console.info(`Project ${id} updated with`, response.status, response.body);
        return response.body;
    }

    async uploadLogo(id, logo) {
        try {
            let result = await this.images.upload(`project-logo-${id}`, logo);
            console.info(`Logo updated, new logo ID is ${result.id}`);
            return result.id;
        } catch (e) {
            console.error(`Exception while uploading a new logo for ${id}`, e);
            throw Error("Cannot upload a new logo")
        }
    }

    async remove(id) {
        console.info(`Project ${id} removing`);
        let response = await request.delete(`/projects/${id}`)
            .use(api);
        console.info(`Project ${id} removed with`, response.status, response.body);
        return response.body
    }
}