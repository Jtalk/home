import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";

let defaultFooter = fromJS({
    links: [],
    logos: [],
});

let Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function footer(state = Map({dataState: Loading.LOADING, data: defaultFooter}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: fromJS(action.data)});
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let result = await ajax.footer.load();
            dispatch(newState(Action.LOADED, result));
        } catch (e) {
            console.error("Cannot load footer info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, footer) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let result = await ajax.footer.update(footer);
            dispatch(newState(Action.UPDATED, result));
        } catch (e) {
            console.error("Cannot load footer info", e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    }
}