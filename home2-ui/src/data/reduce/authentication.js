import {Map} from "immutable";
import {action, error} from "./global/actions";
import dayjs from "dayjs";
import {useImmutableSelector} from "../../utils/redux-store";
import {useLastError, useUpdater2} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax, useAjax} from "./ajax";
import {useDispatch} from "react-redux";

export const EXISTING_PASSWORD_MISMATCH = "The existing password does not match";

let Action = {
    INIT: Symbol("authentication init"),
    LOGGING_IN: Symbol("authentication logging in"),
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
const SESSION_USERNAME_KEY = "session-username";
const DEFAULT = Map({login: undefined, updating: undefined});

export function authentication(state = DEFAULT, action) {
    switch (action.type) {
        case Action.INIT:
            let expiry = window.localStorage.getItem(SESSION_EXPIRY_KEY);
            let username = window.localStorage.getItem(SESSION_USERNAME_KEY);
            if (!expiry || !username) {
                return DEFAULT;
            }
            expiry = expiry && dayjs(expiry);
            if (expiry && expiry.isAfter(dayjs())) {
                console.info("Restoring authentication data from the local store");
                return state.merge({login: Login.LOGGED_IN, expiry, username})
            } else {
                console.info("The authentication data in the local store has expired, cleaning it up");
                window.localStorage.removeItem(SESSION_EXPIRY_KEY);
                window.localStorage.removeItem(SESSION_USERNAME_KEY);
                return DEFAULT;
            }
        case Action.LOGGING_IN:
            return state.merge({login: Login.LOGGING_IN, errorMessage: undefined});
        case Action.LOGIN:
            window.localStorage.setItem(SESSION_EXPIRY_KEY, action.data.expiry);
            window.localStorage.setItem(SESSION_USERNAME_KEY, action.data.username);
            return state.merge({
                login: Login.LOGGED_IN,
                expiry: dayjs(action.data.expiry),
                username: action.data.username,
                errorMessage: undefined
            });
        case Action.LOGOUT:
            window.localStorage.removeItem(SESSION_EXPIRY_KEY);
            window.localStorage.removeItem(SESSION_USERNAME_KEY);
            return DEFAULT;
        case Action.ERROR:
            return state.merge({login: Login.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchAuthentication() {
    yield initAuthentication();
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

export function useUsername() {
    return useImmutableSelector("authentication", "username");
}

export function useLoginError() {
    return useLastError("login");
}

export function useLoginHandler() {
    let ajax = useAjax();
    let dispatch = useDispatch();
    return async form => {
        dispatch(login(ajax, form));
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

function login(ajax, form) {
    return async dispatch => {
        dispatch(action(Action.LOGGING_IN));
        try {
            let result = await ajax.authentication.login(form);
            console.info("Login success");
            dispatch(action(Action.LOGIN, {expiry: result.expiry, username: form.login}));
        } catch (e) {
            console.error("Error logging in", e);
            if (e.status >= 400 && e.status < 500) {
                console.warn("Login failure:", e.response.body.errors);
                dispatch(error(Action.ERROR, (e.response.body.errors || ["unknown"]).join(" | ")));
            } else {
                console.error("Server error", e.response);
                dispatch(error(Action.ERROR, "Unknown error while trying to log in"));
            }
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

function* logout() {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.authentication.logout);
    } catch (e) {
        console.error("Error while logging out", e);
        alert(e.message);
    }
}