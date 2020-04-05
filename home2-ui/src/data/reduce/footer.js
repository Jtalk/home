import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import {useData, useLastError, useLoading, useUpdater, useUpdating} from "./global/hook-barebone";

let defaultFooter = fromJS({
    links: [],
    logos: [],
});

let Action = {
    LOAD: Symbol("footer load"),
    LOADED: Symbol("footer loaded"),
    LOAD_ERROR: Symbol("footer load error"),
    UPDATE: Symbol("footer update"),
    UPDATED: Symbol("footer updated"),
    UPDATE_ERROR: Symbol("footer update error"),
};

export function footer(state = Map({loading: Loading.INITIAL, data: defaultFooter}), action) {
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

export function useFooter() {
    return useData(load, [], "footer");
}

export function useFooterError() {
    return useLastError("footer");
}

export function useFooterLoading() {
    return useLoading("footer");
}

export function useFooterUpdating() {
    return useUpdating("footer");
}

export function useFooterUpdater() {
    return useUpdater(update);
}

function load(ajax) {
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

function update(ajax, footer) {
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