import {EXISTING_PASSWORD_MISMATCH} from "./authentication";
import {useCallback} from "react";
import {superagentPostForm} from "../ajax";

export function usePasswordChanger() {
    return useCallback(async passwords => {
        return await changePassword(passwords.new, passwords.current);
    }, []);
}

async function changePassword(newPassword, oldPassword) {
    try {
        await superagentPostForm("/user", {"old-password": oldPassword, password: newPassword});
    } catch (e) {
        console.error("Error while changing password", e);
        if (e.status === 409) {
            throw Error(EXISTING_PASSWORD_MISMATCH)
        }
        if (e.response && e.response.body) {
            throw Error("Error: " + e.response.body);
        }
        throw e;
    }
}
