import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";
import {Logger} from "../../utils/logger";

let log = Logger.of("data.ajax.owner");

export class OwnerRequests {

    async load() {
        let response = await request.get("/owner")
            .use(api);
        await apiDelay();
        return response.body
    }

    async update(update, photo) {
        let photoId = await this.updatePhoto(photo);
        if (photoId) {
            update = update.set("photoId", photoId);
        }
        let response = await request.post("/owner", update)
            .use(api);
        log.info(`Owner updated with ${response.status}: ${response.text}`);
        return update;
    }

    async updatePhoto(photo) {
        if (!photo) {
            return null;
        }
        try {
            let response = await request.post("/images")
                .attach("img", photo)
                .use(api);

            let body = response.body;
            if (body.status !== "ok") {
                log.error(`Unexpected response from API upon photo upload: ${JSON.stringify(body)}`);
                throw Error("API error while uploading photo");
            }
            return body.id;
        } catch (e) {
            log.error("Exception while uploading a new photo", e);
            throw Error("Cannot upload a new photo")
        }
    }
}