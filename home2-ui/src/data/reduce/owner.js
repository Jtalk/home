import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";

let defaultOwner = fromJS({
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: {},
    bio: ""
});

export const Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function owner(state = Map({loading: Loading.LOADING, data: defaultOwner}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: defaultOwner});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: action.data});
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
            let owner = await ajax.owner.load();
            dispatch(newState(Action.LOADED, fromJS(owner)));
        } catch (e) {
            console.error("Cannot load owner info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let newOwner = await ajax.owner.update(update, photo);
            dispatch(newState(Action.UPDATED, fromJS(newOwner)));
        } catch (e) {
            console.error(`Exception while updating owner bio for ${JSON.stringify(update)}`, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

