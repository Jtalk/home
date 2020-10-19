import api, {superagent} from "./superagent-api";
import ImageRequests from "./images-requests";


export async function load(publishedOnly) {
    console.debug(`Projects (published=${publishedOnly} loading`);
    let response = await (await superagent()).get("/projects")
        .query({published: publishedOnly})
        .use(api);
    console.debug(`Projects (published=${publishedOnly}) loaded with`, response.status, response.body);
    return response.body
}

export async function update(id, update, logo) {
    console.info(`Project ${id} updating`, update);
    if (logo) {
        console.info(`Uploading logo for project ${id}`);
        update.logoId = await uploadLogo(id, logo);
    }
    let response = await (await superagent()).put(`/projects/${id}`, update)
        .use(api);
    console.info(`Project ${id} updated with`, response.status, response.body);
    return response.body;
}

export async function uploadLogo(id, logo) {
    try {
        let result = await ImageRequests.upload(`project-logo-${id}`, logo);
        console.info(`Logo updated, new logo ID is ${result.id}`);
        return result.id;
    } catch (e) {
        console.error(`Exception while uploading a new logo for ${id}`, e);
        throw Error("Cannot upload a new logo")
    }
}

export async function remove(id) {
    console.info(`Project ${id} removing`);
    let response = await (await superagent()).delete(`/projects/${id}`)
        .use(api);
    console.info(`Project ${id} removed with`, response.status, response.body);
    return response.body
}

const ProjectRequests = {load, update, uploadLogo, remove}
export default ProjectRequests;
