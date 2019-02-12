import * as request from "superagent";
import api from "../utils/superagent-api";
import {apiDelay} from "../utils/test-api-delay";

export async function loadOwner() {
    let response = await request.get("/owner")
        .use(api);
    await apiDelay();
    return response.body
}