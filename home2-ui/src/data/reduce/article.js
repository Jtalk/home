import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";

export const Action = {
    LOAD: Symbol("article load"),
    LOADED: Symbol("article loaded"),
    LOAD_ERROR: Symbol("article load error"),
    UPDATE: Symbol("article update"),
    UPDATED: Symbol("article updated"),
    UPDATE_ERROR: Symbol("article update error"),
};

export function article(state = fromJS({loading: Loading.LOADING, data: {}}), action) {
    switch (action.type) {
        case Action.LOAD:
            return fromJS({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, deleting: undefined, data: {}});
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

export function load(ajax, articleId) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let article = await ajax.articles.loadOne(articleId);
            dispatch(newState(Action.LOADED, article));
        } catch (e) {
            console.error(`Cannot load article info ${articleId}`, e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, articleId, update) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let updated = await ajax.articles.update(articleId, update);
            dispatch(newState(Action.UPDATED, updated));
        } catch (e) {
            console.error(`Exception while updating article ${articleId}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}
