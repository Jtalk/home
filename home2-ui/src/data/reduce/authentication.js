import {Map} from "immutable";
import {action} from "./global/actions";

let Action = {
    LOGIN: Symbol("login"),
    LOGOUT: Symbol("logout"),
};

const DEFAULT = Map({loggedIn: false});

export function footer(state = DEFAULT, action) {
    switch (action.type) {
        case Action.LOGIN:
            return state.merge({loggedIn: true});
        case Action.LOGOUT:
            return DEFAULT;
        default:
            return state;
    }
}

export function loggedIn() {
    return action(Action.LOGIN);
}

export function logout() {
    return action(Action.LOGOUT);
}