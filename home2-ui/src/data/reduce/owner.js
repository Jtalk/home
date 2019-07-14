import {fromJS, Map} from "immutable";
import {Logger} from "../../utils/logger";

let log = Logger.of("data.reduce.owner");

let defaultOwner = fromJS({
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: [],
    bio: ""
});

let Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function owner(state = Map({loading: true, data: defaultOwner}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: true, data: defaultOwner});
        case Action.LOADED:
            return Map({loading: false, loaded: true, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: false, loaded: true, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: true, updated: false});
        case Action.UPDATED:
            return state.merge({updating: false, updated: true, data: action.data});
        case Action.UPDATE_ERROR:
            return state.merge({updating: false, updated: false, errorMessage: action.errorMessage});
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
            let owner = await ajax.owner.load();
            dispatch(newState(Action.LOADED, fromJS(owner)));
        } catch (e) {
            log.error("Cannot load owner info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let newOwner = await ajax.owner.update(update, photo);
            dispatch(newState(Action.UPDATED, newOwner));
        } catch (e) {
            log.error(`Exception while updating owner bio for ${JSON.stringify(update)}`, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

