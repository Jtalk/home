import {Map, Set} from "immutable";
import {action, newState} from "./global/actions";
import {Loading} from "./global/enums";
import {useData} from "./global/hook-barebone";

export const Action = {
    LOADING: Symbol("tags loading"),
    LOADED: Symbol("tags loaded"),
    LOAD_ERROR: Symbol("tags loading error"),
};

export function tags(state = Map({loading: Loading.INITIAL, data: Set()}), action) {
    switch (action.type) {
        case Action.LOADING:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return state.merge({loading: Loading.READY, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.data});
        default:
            return state;
    }
}

export function useAvailableTags() {
    return useData(load, "tags");
}

function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOADING));
        try {
            let tags = await ajax.tags.load();
            dispatch(newState(Action.LOADED, tags));
        } catch (e) {
            console.error("Cannot load tags info", e);
            dispatch(newState(Action.LOAD_ERROR, e.message));
        }
    }
}