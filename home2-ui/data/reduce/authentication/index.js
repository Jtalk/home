import merge from "lodash/merge";
import dayjs from "dayjs";
import {HYDRATE} from "next-redux-wrapper";
import {Login} from "./login-state";
import {Action} from "./action";

export * from "./action";
export * from "./hooks";
export * from "./saga";
export * from "./segment";

const DEFAULT = {login: null, updating: null};
export default function authentication(state = DEFAULT, action) {
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
