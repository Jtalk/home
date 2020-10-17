import * as request from "superagent";
import api from "./superagent-api";

export class AuthenticationRequests {
    async login(form) {
        console.info(`Logging in ${form.username}`);
        let response = await request.post("/login")
            .type("form")
            .send(form)
            .use(api);
        console.info(`Logged in with`, response.status, response.body);
        return response.body.status === "ok" && response.body;
    }

    async changePassword(oldPassword, newPassword) {
        console.info(`Changing password`);
        let response = await request.put("/user")
            .type("form")
            .send({password: newPassword, "old-password": oldPassword})
            .use(api);
        console.info(`Password changed with`, response.status, response.body);
        return response.body;
    }

    async refresh() {
        console.debug(`Refreshing authentication token`);
        let response = await request.post("/login/refresh")
            .use(api);
        console.debug(`Authentication token refreshed with`, response.status, response.body);
        return response.body.status === "ok" && response.body;
    }

    async logout() {
        console.info(`Logging out`);
        let response = await request.post("/logout")
            .use(api);
        console.info(`Logged out with`, response.status, response.body);
        return response.body;
    }
}