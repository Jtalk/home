import {Map} from "immutable";
import {action, newState} from "./global/actions";
import dayjs from "dayjs";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../../utils/redux-store";

let Action = {
    INIT: Symbol("init"),
    LOGGING_IN: Symbol("logging_in"),
    LOGIN: Symbol("login"),
    LOGOUT: Symbol("logout"),
    ERROR: Symbol("error"),
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

// Pre-load possible authentication state from the local store.
export function useAuthenticationInit() {
    let dispatch = useDispatch();
    useEffect(() => {
        dispatch(action(Action.INIT));
    });
}

export function useLoggedIn() {
    return useImmutableSelector("authentication", "login") === Login.LOGGED_IN;
}

export function login(ajax, form) {
    return async dispatch => {
        dispatch(action(Action.LOGGING_IN));
        try {
            let result = await ajax.authentication.login(form);
            console.info("Login success");
            dispatch(newState(Action.LOGIN, {expiry: result.expiry}));
        } catch (e) {
            console.error("Error logging in", e);
            if (e.status === 400) {
                console.warn("Login failure:", e.response.body.errors);
                dispatch(newState(Action.ERROR, {error: e.response.body.errors.join(" | ")}));
            }
        }
    }
}

export function logout(ajax) {
    return async dispatch => {
        try {
            await ajax.authentication.logout();
            return dispatch(action(Action.LOGOUT));
        } catch (e) {
            console.error("Error while logging out", e);
            alert(e.message);
        }
    };
}