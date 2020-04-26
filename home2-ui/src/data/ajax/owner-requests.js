import * as request from "superagent";
import api from "./superagent-api";

export class OwnerRequests {

    constructor(images) {
        this.images = images;
    }

    async load() {
        let response = await request.get("/owner")
            .use(api);
        return response.body
    }

    update = async (update, photo) => {
        if (photo) {
            update.photoId = await this.updatePhoto(photo);
        }
        let response = await request.post("/owner", update)
            .use(api);
        console.info(`Owner updated with ${response.status}: ${response.text}`);
        return Object.assign({}, response.body);
    }

    updatePhoto = async (photo) => {
        console.debug("Uploading photo", photo);
        try {
            let response = await this.images.upload("owner photo", photo);
            let body = response.body;
            console.debug(`Photo updated, new photo ID is ${body.id}`);
            return body.id;
        } catch (e) {
            console.error("Exception while uploading a new photo", e);
            throw Error("Cannot upload a new photo")
        }
    }
}