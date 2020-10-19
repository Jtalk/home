import merge from "lodash/merge";
import dayjs from "dayjs";
import {HYDRATE} from "next-redux-wrapper";
import {Login} from "./login-state";

export const Action = {
    INIT: "authentication init",
    LOGGING_IN: "authentication logging in",
    LOGIN: "authentication login",
    TRIGGER_REFRESH: "authentication trigger refresh",
    REFRESH: "authentication refresh",
    LOGOUT: "authentication logout",
    ERROR: "authentication error",
};
export const segment = "authentication";

const DEFAULT = {login: null, updating: null};
export function reducer(state = DEFAULT, action) {
    switch (action.type) {
        case Action.LOGGING_IN:
            return merge({}, state, {login: Login.LOGGING_IN, errorMessage: null});
        case Action.LOGIN:
            return merge({}, state, {
                login: Login.LOGGED_IN,
                expiry: dayjs(action.data.expiry),
                username: action.data.username,
                errorMessage: null
            });
        case Action.REFRESH:
            return merge({}, state, {
                expiry: dayjs(action.data.expiry),
            });
        case Action.LOGOUT:
            return DEFAULT;
        case Action.ERROR:
            return merge({}, state, {login: Login.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return state; // No server-side activity around authentication.
        default:
            return state;
    }
}
