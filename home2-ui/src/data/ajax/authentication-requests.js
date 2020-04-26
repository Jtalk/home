import * as request from "superagent";
import api from "./superagent-api";

export class AuthenticationRequests {
    async login(form) {
        let response = await request.post("/login")
            .type("form")
            .send(form)
            .use(api);
        return response.body.status === "ok" && response.body;
    }

    async changePassword(oldPassword, newPassword) {
        let response = await request.put("/user")
            .type("form")
            .send({password: newPassword, "old-password": oldPassword})
            .use(api);
        return response.body;
    }

    async refresh() {
        let response = await request.post("/login/refresh")
            .use(api);
        return response.body.status === "ok" && response.body;
    }

    async logout() {
        return await request.post("/logout")
            .use(api);
    }
}