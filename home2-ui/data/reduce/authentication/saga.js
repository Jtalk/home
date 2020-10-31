import {call, delay, put, select, takeEvery} from "redux-saga/effects";
import AuthenticationRequests from "../../ajax/authentication-requests";
import {action, error} from "../global/actions";
import dayjs from "dayjs";
import {immutableSelector} from "../../redux-store";
import {reportError} from "../../../utils/error-reporting";
import storageAvailable from "storage-available";
import {Action} from "./action";

const SESSION_EXPIRY_KEY = "session-expiry";
const SESSION_USERNAME_KEY = "session-username";

export * from "./hooks";
export * from "./saga";

export function* watchAuthentication() {
    yield takeEvery(Action.LOGIN, ({data: {expiry}}) => runTokenRefresh(expiry));
    yield takeEvery(Action.LOGIN, ({data}) => updateLocalStore(data));
    yield takeEvery(Action.REFRESH, ({data: {expiry}}) => runTokenRefresh(expiry));
    yield takeEvery(Action.REFRESH, ({data}) => updateLocalStore(data));
    yield takeEvery(Action.LOGOUT, logout);

    if (process.browser) {
        yield initAuthentication();
    }
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

function* refreshAuthentication() {
    try {
        let response = yield call(AuthenticationRequests.refresh);
        return response.expiry;
    } catch (e) {
        console.error("Error refreshing authentication", e);
        yield put(error(Action.ERROR, e.toLocaleString(), {error: e}));
    }
}

function* logout() {
    try {
        yield call(AuthenticationRequests.logout);
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
