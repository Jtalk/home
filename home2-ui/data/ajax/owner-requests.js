import * as request from "superagent";
import api from "./superagent-api";

export class OwnerRequests {

    constructor(images) {
        this.images = images;
    }

    async load() {
        console.debug(`Owner info loading`);
        let response = await request.get("/owner")
            .use(api);
        console.debug(`Owner info loaded with`, response.status, response.body);
        return response.body
    }

    update = async (update, photo) => {
        console.info(`Owner updating`, update);
        if (photo) {
            console.info(`Uploading owner photo for`, update);
            update.photoId = await this.updatePhoto(photo);
        }
        let response = await request.post("/owner", update)
            .use(api);
        console.info(`Owner updated with`, response.status, response.body);
        return response.body;
    }

    updatePhoto = async (photo) => {
        try {
            let result = await this.images.upload("owner photo", photo);
            console.info(`Photo updated, new photo ID is ${result.id}`);
            return result.id;
        } catch (e) {
            console.error("Exception while uploading a new photo", e);
            throw Error("Cannot upload a new photo")
        }
    }
}