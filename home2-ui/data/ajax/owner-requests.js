import api, {superagent} from "./superagent-api";

export async function load() {
    console.debug(`Owner info loading`);
    let response = await (await superagent()).get("/owner")
        .use(api);
    console.debug(`Owner info loaded with`, response.status, response.body);
    return response.body
}

export async function update(update, photo) {
    console.info(`Owner updating`, update);
    if (photo) {
        console.info(`Uploading owner photo for`, update);
        update.photoId = await updatePhoto(photo);
    }
    let response = await (await superagent()).post("/owner", update)
        .use(api);
    console.info(`Owner updated with`, response.status, response.body);
    return response.body;
}

export async function updatePhoto(photo) {
    try {
        const ImageRequests = await import("../ajax/images-requests")
        let result = await ImageRequests.upload("owner photo", photo);
        console.info(`Photo updated, new photo ID is ${result.id}`);
        return result.id;
    } catch (e) {
        console.error("Exception while uploading a new photo", e);
        throw Error("Cannot upload a new photo")
    }
}

