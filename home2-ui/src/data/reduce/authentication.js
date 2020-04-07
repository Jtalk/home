import {Map} from "immutable";
import {action, error} from "./global/actions";
import dayjs from "dayjs";
import {useImmutableSelector} from "../../utils/redux-store";
import {useLastError, useUpdater2} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax} from "./ajax";

let Action = {
    INIT: Symbol("authentication init"),
    LOGGING_IN: Symbol( "authentication logging_in"),
    LOGIN: Symbol("authentication login"),
    LOGOUT: Symbol("authentication logout"),
    ERROR: Symbol("authentication error"),
};

export const Login = {
    LOGGING_IN: Symbol("logging_in"),
    LOGGED_IN: Symbol("logged_in"),
    ERROR: Symbol("error"),
};

const SESSION_EXPIRY_KEY = "session-expiry";
const DEFAULT = Map({login: undefined, updating: undefined});

export function authentication(state = DEFAULT, action) {
    switch (action.type) {
        case Action.INIT:
            let expiry = window.localStorage.getItem(SESSION_EXPIRY_KEY);
            if (!expiry) {
                return DEFAULT;
            }
            expiry = expiry && dayjs(expiry);
            if (expiry && expiry.isAfter(dayjs())) {
                console.info("Restoring authentication data from the local store");
                return state.merge({login: Login.LOGGED_IN, expiry})
            } else {
                console.info("The authentication data in the local store has expired, cleaning it up");
                window.localStorage.removeItem(SESSION_EXPIRY_KEY);
                return DEFAULT;
            }
        case Action.LOGGING_IN:
            return state.merge({login: Login.LOGGING_IN, errorMessage: undefined});
        case Action.LOGIN:
            window.localStorage.setItem(SESSION_EXPIRY_KEY, action.data.expiry);
            return state.merge({login: Login.LOGGED_IN, expiry: dayjs(action.data.expiry), errorMessage: undefined});
        case Action.LOGOUT:
            window.localStorage.removeItem(SESSION_EXPIRY_KEY);
            return DEFAULT;
        case Action.ERROR:
            return state.merge({login: Login.ERROR, errorMessage: action.data.error});
        default:
            return state;
    }
}

export function* watchAuthentication() {
    yield initAuthentication();
    yield takeEvery(Action.LOGGING_IN, ({data}) => login(data.update));
    yield takeEvery(Action.LOGOUT, logout);
}

// Pre-load possible authentication state from the local store.
export function* initAuthentication() {
    yield put(action(Action.INIT));
}

export function useLoginStatus() {
    return useImmutableSelector("authentication", "login");
}

export function useLoggedIn() {
    return useLoginStatus() === Login.LOGGED_IN;
}

export function useLoginError() {
    return useLastError("login");
}

export function useLoginHandler() {
    return useUpdater2(Action.LOGGING_IN);
}

export function useLogoutHandler() {
    return useUpdater2(Action.LOGOUT);
}

function* login(form) {
    let ajax = yield fetchAjax();
    try {
        let result = yield call(ajax.authentication.login, form);
        console.info("Login success");
        yield put(action(Action.LOGIN, {expiry: result.expiry}));
    } catch (e) {
        console.error("Error logging in", e);
        if (e.status >= 400 && e.status < 500) {
            console.warn("Login failure:", e.response.body.errors);
            yield put(error(Action.ERROR, e.response.body.errors || ["unknown"]).join(" | "));
        } else {
            console.error("Server error", e.response);
            yield put(error(Action.ERROR, "Unknown error while trying to log in"));
        }

    }
}

function* logout() {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.authentication.logout);
    } catch (e) {
        console.error("Error while logging out", e);
        alert(e.message);
    }
}