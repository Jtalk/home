import {fromJS, Map} from "immutable";
import {Logger} from "../../utils/logger";
import DataState from "./global/loading";

let log = Logger.of("data.reduce.footer");

let defaultFooter = fromJS({
    links: [],
    logos: [],
});

let Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
};

export function footer(state = Map({dataState: DataState.LOADING, data: defaultFooter}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({dataState: DataState.LOADING});
        case Action.LOADED:
            return Map({dataState: DataState.READY, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({dataState: DataState.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

function action(action) {
    return {
        type: action
    }
}

function newState(action, newOwner) {
    return {
        type: action,
        data: newOwner
    }
}

function error(action, errorMsg) {
    return {
        type: action,
        errorMessage: errorMsg
    }
}

export function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let footer = await ajax.footer.load();
            dispatch(newState(Action.LOADED, fromJS(footer)));
        } catch (e) {
            log.error("Cannot load footer info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}