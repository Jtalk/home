import {fromJS, Map} from "immutable";
import {Deleting, Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";

export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
    DELETE: Symbol("delete"),
    DELETED: Symbol("deleted"),
    DELETE_ERROR: Symbol("delete error"),
};

const DEFAULT_PAGINATION = {
    page: 0,
    pageSize: 0,
    total: 0
};

const DEFAULT_DATA = {
    pagination: DEFAULT_PAGINATION,
    articles: []
};

export function articles(state = fromJS({loading: Loading.LOADING, data: DEFAULT_DATA}), action) {
    switch (action.type) {
        case Action.LOAD:
            return fromJS({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, deleting: undefined, data: DEFAULT_DATA});
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
        case Action.DELETE:
            return state.merge({deleting: Deleting.DELETING, errorMessage: undefined});
        case Action.DELETED:
            return state.merge({deleting: Deleting.DELETED, errorMessage: undefined, data: fromJS(action.data)});
        case Action.DELETE_ERROR:
            return state.merge({deleting: Deleting.DELETE_ERROR, errorMessage: action.data});
        default:
            return state;
    }
}

export function loadPage(ajax, page, pageSize = DEFAULT_PAGE_SIZE) {
    if (pageSize > MAX_PAGE_SIZE) {
        throw Error(`The requested page size ${pageSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let articlesResult = await ajax.articles.load(page, pageSize);
            dispatch(newState(Action.LOADED, articlesResult));
        } catch (e) {
            console.error("Cannot load article info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, articleId, update, currentPage, currentPageSize) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            await ajax.articles.update(articleId, update);
            let updatedPage = await ajax.articles.load(currentPage, currentPageSize);
            dispatch(newState(Action.UPDATED, updatedPage));
        } catch (e) {
            console.error(`Exception while updating article ${articleId}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

export function remove(ajax, articleId, page, pageSize) {
    return async dispatch => {
        dispatch(action(Action.DELETE));
        try {
            await ajax.articles.remove(articleId);
            let updatedList = await ajax.articles.load(page, pageSize);
            dispatch(newState(Action.DELETED, updatedList));
        } catch (e) {
            console.error(`Exception while deleting article ${articleId}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString()));
        }
    };
}
