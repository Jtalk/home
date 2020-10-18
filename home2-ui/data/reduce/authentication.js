import {Map} from "immutable";
import {action, error} from "./global/actions";
import dayjs from "dayjs";
import {immutableSelector, useImmutableSelector} from "../redux-store";
import {useLastError, useUpdater2} from "./global/hook-barebone";
import {call, put, takeEvery, delay, select} from "redux-saga/effects";
import {ajaxSelector, fetchAjax, useAjax} from "./ajax";
import {useDispatch} from "react-redux";
import {reportError} from "../../utils/error-reporting";
import storageAvailable from "storage-available";

export const EXISTING_PASSWORD_MISMATCH = "The existing password does not match";

let Action = {
    INIT: "authentication init",
    LOGGING_IN: "authentication logging in",
    LOGIN: "authentication login",
    TRIGGER_REFRESH: "authentication trigger refresh",
    REFRESH: "authentication refresh",
    LOGOUT: "authentication logout",
    ERROR: "authentication error",
};

export const Login = {
    LOGGING_IN: "logging_in",
    LOGGED_IN: "logged_in",
    ERROR: "error",
};

const SESSION_EXPIRY_KEY = "session-expiry";
const SESSION_USERNAME_KEY = "session-username";
const DEFAULT = Map({login: null, updating: null});

export function authentication(state = DEFAULT, action) {
    switch (action.type) {
        case Action.LOGGING_IN:
            return state.merge({login: Login.LOGGING_IN, errorMessage: null});
        case Action.LOGIN:
            return state.merge({
                login: Login.LOGGED_IN,
                expiry: dayjs(action.data.expiry),
                username: action.data.username,
                errorMessage: null
            });
        case Action.REFRESH:
            return state.merge({
                expiry: dayjs(action.data.expiry),
            });
        case Action.LOGOUT:
            return DEFAULT;
        case Action.ERROR:
            return state.merge({login: Login.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchAuthentication() {
    yield takeEvery(Action.LOGIN, ({data: {expiry}}) => runTokenRefresh(expiry));
    yield takeEvery(Action.LOGIN, ({data}) => updateLocalStore(data));
    yield takeEvery(Action.REFRESH, ({data: {expiry}}) => runTokenRefresh(expiry));
    yield takeEvery(Action.REFRESH, ({data}) => updateLocalStore(data));
    yield takeEvery(Action.LOGOUT, logout);
    yield initAuthentication();
}

// Pre-load possible authentication state from the local store.
function* initAuthentication() {
    let expiry = localStoreGet(SESSION_EXPIRY_KEY);
    let username = localStoreGet(SESSION_USERNAME_KEY);
    if (!expiry || !username) {
        console.log("No saved credentials found in local store, unauthenticated");
        return;
    }
    expiry = expiry && dayjs(expiry);
    if (expiry && expiry.isAfter(dayjs())) {
        expiry = yield refreshAuthentication();
        if (expiry) {
            console.info(`Restoring authentication data from the local store for ${username}`);
            yield put(action(Action.LOGIN, {expiry, username}));
            return;
        }
        // Else our auth is expired / our backend has lost our session due to a restart, cleaning the local store
    }
    // Else our auth has expired already, cleaning the local store
    console.info("The authentication data in the local store has expired, cleaning it up");
    clearLocalStore();
}

function* refresh() {
    try {
        let newExpiry = yield refreshAuthentication();
        yield put(action(Action.REFRESH, {expiry: newExpiry}));
    } catch (e) {
        console.error("Could not refresh token", e);
        reportError(e);
    }
}

function* runTokenRefresh(expiry) {
    expiry = dayjs(expiry);
    let now = dayjs();
    let timeUntilRefresh = expiry.diff(now);
    if (timeUntilRefresh <= 0) {
        console.error("Auth token refresh was triggered after the token had already expired", expiry && expiry.toISOString(), ">", now.toISOString());
        return;
    }
    timeUntilRefresh = timeUntilRefresh / 2; // Try refreshing halfway through expiry
    console.debug("Waiting for ", timeUntilRefresh, "ms to refresh the auth token");
    yield delay(timeUntilRefresh);
    let currentExpiry = yield select(immutableSelector("authentication", "expiry"));
    if (currentExpiry && dayjs(expiry).isSame(currentExpiry)) {
        yield refresh();
    } else {
        console.log(`Cancelling token refresh: mismatching expiry. It usually indicates that the token has been reissued meanwhile`,
            expiry && dayjs(expiry).toISOString(), currentExpiry && currentExpiry.toISOString());
    }
}

export function useLoginStatus() {
    return useImmutableSelector("authentication", "login");
}

export function useLoggedIn() {
    return useLoginStatus() === Login.LOGGED_IN;
}

export function useUsername() {
    return useImmutableSelector("authentication", "username");
}

export function useLoginError() {
    return useLastError("authentication");
}

export function useLoginHandler() {
    let dispatch = useDispatch();
    return async form => {
        return await dispatch(login(form));
    };
}

export function useLogoutHandler() {
    return useUpdater2(Action.LOGOUT);
}

export function usePasswordChanger() {
    let ajax = useAjax();
    return async passwords => {
        return await changePassword(ajax, passwords.new, passwords.current);
    };
}

function login(form) {
    return async (dispatch, getState) => {
        let ajax = ajaxSelector(getState());
        dispatch(action(Action.LOGGING_IN));
        try {
            let result = await ajax.authentication.login(form);
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

async function changePassword(ajax, newPassword, oldPassword) {
    try {
        await ajax.authentication.changePassword(oldPassword, newPassword);
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

function* refreshAuthentication() {
    let ajax = yield fetchAjax();
    try {
        let response = yield call(ajax.authentication.refresh);
        return response.expiry;
    } catch (e) {
        console.error("Error refreshing authentication", e);
        yield put(error(Action.ERROR, e.toLocaleString(), {error: e}));
    }
}

function* logout() {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.authentication.logout);
        clearLocalStore();
    } catch (e) {
        console.error("Error while logging out", e);
        reportError(e);
        alert(e.message);
    }
}

function updateLocalStore(actionData) {
    localStoreSet(SESSION_EXPIRY_KEY, actionData.expiry);
    if (actionData.username) {
        localStoreSet(SESSION_USERNAME_KEY, actionData.username);
    }
}

function clearLocalStore() {
    localStoreRemove(SESSION_EXPIRY_KEY);
    localStoreRemove(SESSION_USERNAME_KEY);
}

function localStoreGet(name) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.getItem(name);
    } else {
        return undefined;
    }
}

function localStoreSet(name, value) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.setItem(name, value);
    } else {
        console.warn("Local store not available, cannot save authentication information between sessions");
    }
}

function localStoreRemove(name) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.removeItem(name);
    } else {
        console.warn("Local store not available, cannot remove authentication information between sessions");
    }
}
