import * as request from "superagent";
import api from "../../utils/superagent-api";

export class AuthenticationRequests {
    async login(form) {
        let response = await request.post("/login")
            .type("form")
            .send(form)
            .use(api);
        return response.ok;
    }
}