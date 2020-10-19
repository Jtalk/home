import api, {superagent} from "./superagent-api";

export async function login(form) {
    console.info(`Logging in ${form.username}`);
    let response = await (await superagent()).post("/login")
        .type("form")
        .send(form)
        .use(api);
    console.info(`Logged in with`, response.status, response.body);
    return response.body.status === "ok" && response.body;
}

export async function changePassword(oldPassword, newPassword) {
    console.info(`Changing password`);
    let response = await (await superagent()).put("/user")
        .type("form")
        .send({password: newPassword, "old-password": oldPassword})
        .use(api);
    console.info(`Password changed with`, response.status, response.body);
    return response.body;
}

export async function refresh() {
    console.debug(`Refreshing authentication token`);
    let response = await (await superagent()).post("/login/refresh")
        .use(api);
    console.debug(`Authentication token refreshed with`, response.status, response.body);
    return response.body.status === "ok" && response.body;
}

export async function logout() {
    console.info(`Logging out`);
    let response = await (await superagent()).post("/logout")
        .use(api);
    console.info(`Logged out with`, response.status, response.body);
    return response.body;
}

const AuthenticationRequests = {
    login, changePassword, refresh, logout
}
export default AuthenticationRequests;
