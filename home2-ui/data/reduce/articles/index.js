import {publishableData} from "../global/publishable-data";
import {addPage, defaultPages} from "../global/paginated-data";
import merge from "lodash/merge";
import {Deleting, Loading, Updating} from "../global/enums";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";

export * from "./actions";
export * from "./constant";
export * from "./hooks";
export * from "./saga";

export const Action = {
    LOAD: Symbol("articles load"),
    LOADED: Symbol("articles loaded"),
    LOAD_ONE: Symbol("single article load"),
    LOADED_ONE: Symbol("single article loaded"),
    LOAD_ONE_ERROR: Symbol("single article load error"),
    LOAD_ERROR: Symbol("articles load error"),
    UPDATE: Symbol("article update"),
    UPDATED: Symbol("article updated"),
    UPDATE_ERROR: Symbol("article update error"),
    DELETE: Symbol("articles delete"),
    DELETED: Symbol("articles deleted"),
    DELETE_ERROR: Symbol("articles delete error"),
};
export const segment = "articles";

export default function articles(state = {
    loading: null, loadings: {}, data: {}, pages: defaultPages()
}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return merge({}, state, {
                loading: Loading.READY, errorMessage: null,
                data: mergeCache(state.data, action.data.articles),
                pages: addPage(state.pages, publishableIds(action.data.articles, !action.data.publishedOnly), action.data.pagination),
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.LOAD_ONE:
            return merge({}, state, {
                loadings: {...state.loadings, [action.data]: Loading.LOADING}
            });
        case Action.LOADED_ONE:
            return merge({}, state, {
                loadings: {...state.loadings, [action.data.id]: Loading.READY}, errorMessage: null,
                data: mergeCache(state.data, [action.data])
            });
        case Action.LOAD_ONE_ERROR:
            return merge({}, state, {
                loadings: {...state.loadings, [action.ctx.id]: Loading.ERROR}, errorMessage: action.errorMessage
            });
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING, errorMessage: null});
        case Action.UPDATED:
            return merge({}, state, {
                updating: Updating.UPDATED, errorMessage: null,
                data: mergeCache({}, [action.data]),
                pages: defaultPages(),
            });
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return merge({}, state, {deleting: Deleting.DELETING});
        case Action.DELETED:
            return merge({}, state, {
                deleting: Deleting.DELETED, errorMessage: null,
                data: mergeCache({}, action.data.articles),
                pages: addPage(defaultPages(), publishableIds(action.data.articles, !action.data.publishedOnly), action.data.pagination),
            });
        case Action.DELETE_ERROR:
            return merge({}, state, {deleting: Deleting.DELETE_ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

function mergeCache(iCache, articles) {
    const result = {...iCache};
    articles.forEach(a => {
        result[a.id] = a;
    });
    return result;
}

function publishableIds(articles, withUnpublished) {
    return publishableData(articles, withUnpublished, a => a.id);
}
