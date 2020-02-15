import {Set} from "immutable";
import {newState} from "./global/actions";

export const Action = {
    LOADED: Symbol("loaded"),
};

export function tags(state = Set(), action) {
    switch (action.type) {
        case Action.LOADED:
            return Set(action.data);
        default:
            return state;
    }
}

export function load(ajax) {
    return async dispatch => {
        try {
            let tags = await ajax.tags.load();
            dispatch(newState(Action.LOADED, tags));
        } catch (e) {
            console.error("Cannot load tags info", e);
        }
    }
}