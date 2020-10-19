import {useImmutableSelector} from "../../redux-store";
import {Action, segment} from "./reducer";
import {useLastError, useUpdater2} from "../global/hook-barebone";
import {useDispatch} from "react-redux";
import {useCallback} from "react";
import {Login} from "./login-state";
import {action, error} from "../global/actions";
import AuthenticationRequests from "../../ajax/authentication-requests";
import {EXISTING_PASSWORD_MISMATCH} from "./messages";

export function useLoginStatus() {
    return useImmutableSelector(segment, "login");
}

export function useLoggedIn() {
    return useLoginStatus() === Login.LOGGED_IN;
}

export function useUsername() {
    return useImmutableSelector(segment, "username");
}

export function useLoginError() {
    return useLastError(segment);
}

export function useLoginHandler() {
    let dispatch = useDispatch();
    return useCallback(async form => {
        return await dispatch(login(form));
    }, [dispatch]);
}

export function useLogoutHandler() {
    return useUpdater2(Action.LOGOUT);
}

export function usePasswordChanger() {
    return async passwords => {
        return await changePassword(passwords.new, passwords.current);
    };
}

function login(form) {
    return async (dispatch, getState) => {
        dispatch(action(Action.LOGGING_IN));
        try {
            let result = await AuthenticationRequests.login(form);
            console.info("Login success");
            dispatch(action(Action.LOGIN, {expiry: result.expiry, username: form.login}));
            return true;
        } catch (e) {
            console.error("Error logging in", e);
            if (e.status >= 400 && e.status < 500) {
                console.warn("Login failure:", e.response.body.errors);
                dispatch(error(Action.ERROR, (e.response.body.errors || ["unknown"]).join(" | "), {error: e}));
            } else {
                console.error("Server error", e.response);
                dispatch(error(Action.ERROR, "Unknown error while trying to log in", {error: e}));
            }
            return false;
        }
    }
}

async function changePassword(newPassword, oldPassword) {
    try {
        await AuthenticationRequests.changePassword(oldPassword, newPassword);
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
