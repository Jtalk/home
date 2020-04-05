import {fromJS, Map} from "immutable";
import {Deleting, Loading} from "./global/enums";
import {action, error, newState} from "./global/actions";

export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: Symbol("articles load"),
    LOADED: Symbol("articles loaded"),
    LOAD_ERROR: Symbol("articles load error"),
    DELETE: Symbol("articles delete"),
    DELETED: Symbol("articles deleted"),
    DELETE_ERROR: Symbol("articles delete error"),
};

const DEFAULT_PAGINATION = {
    current: 0,
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

export function loadPage(ajax, page, pageSize = DEFAULT_PAGE_SIZE, publishedOnly = false) {
    if (pageSize > MAX_PAGE_SIZE) {
        throw Error(`The requested page size ${pageSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let articlesResult = await ajax.articles.load(page, pageSize, publishedOnly);
            dispatch(newState(Action.LOADED, articlesResult));
        } catch (e) {
            console.error(`Cannot load article info page = ${page}, page size = ${pageSize}`, e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function loadPagePublished(ajax, page, pageSize = DEFAULT_PAGE_SIZE) {
    return loadPage(ajax, page, pageSize, true);
}

export function remove(ajax, articleId, page, pageSize = DEFAULT_PAGE_SIZE) {
    return async dispatch => {
        dispatch(action(Action.DELETE));
        try {
            await ajax.articles.remove(articleId);
            let updatedList = ajax.articles.load(page, pageSize);
            dispatch(newState(Action.DELETED, updatedList));
        } catch (e) {
            console.error(`Exception while deleting article ${articleId}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString()));
        }
    };
}
