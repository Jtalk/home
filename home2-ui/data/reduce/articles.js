import {Deleting, Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {addPage, defaultPages, pageSizeSelector, usePage, usePageSize, useTotalCount} from "./global/paginated-data";
import {call, put, select, takeEvery, takeLatest} from "redux-saga/effects";
import {
    useDeleter2,
    useDeleting,
    useLastError,
    useLoader,
    useLoading,
    useUpdater2,
    useUpdating
} from "./global/hook-barebone";
import {allSelector, publishableData, publishedSelector} from "./global/publishable-data";
import {useMemo} from "react";
import {hydrate, useImmutableSelector} from "../redux-store";
import {useRouter} from "next/router";
import {HYDRATE} from "next-redux-wrapper";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";
import ArticlesRequests from "../ajax/articles-requests";

export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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

export function reducer(state = {
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

export const articleActions = {
    load: () => ({
        type: Action.LOAD,
        data: {
            page: 0,
            pageSize: DEFAULT_PAGE_SIZE,
            publishedOnly: true,
        },
        [WAIT_FOR_ACTION]: Action.LOADED,
        [ERROR_ACTION]: Action.LOAD_ERROR
    }),
    loadOne: (id) => ({
        type: Action.LOAD_ONE, data: id, [WAIT_FOR_ACTION]: Action.LOADED_ONE, [ERROR_ACTION]: Action.LOAD_ONE_ERROR
    }),
}

export function serialiseJSON(state) {
    const result = {...state};
    if (result?.data) {
        result.data = mapValues(result.data, v => ({...v, created: v.created?.getTime()}));
    }
    return result;
}

export function deserialiseJSON(json) {
    const result = {...json};
    if (result?.data) {
        result.data = mapValues(result.data, v => ({...v, created: v.created && new Date(v.created)}));
    }
    return result;
}

export function* watchArticles() {
    yield takeLatest(Action.LOAD, ({data}) => load(data.page, data.pageSize, data.publishedOnly));
    yield takeEvery(Action.LOAD_ONE, ({data}) => loadOne(data));
    yield takeEvery(Action.UPDATE, ({data}) => update(data.extra.id, data.update, data.extra.redirectTo));
    yield takeEvery(Action.DELETE, ({data}) => remove(data.id, data.extra.page));
}

export function useArticles(page, pageSize, withUnpublished = false) {
    let existingSize = useArticlesPageSize();
    let existingPage = usePage(page, segment, "pages");
    let data = useImmutableSelector(segment, "data");
    let publishedPage = publishedSelector(null)(existingPage);
    let allPage = allSelector(null)(existingPage);
    let loadAction = useMemo(
        () => action(Action.LOAD, {page, pageSize, publishedOnly: !withUnpublished}),
        [page, pageSize, withUnpublished]);
    useLoader(loadAction, !existingPage || existingSize !== pageSize || (withUnpublished && !allPage));
    return pageContent(withUnpublished ? allPage : publishedPage, data);

}

export function useArticle(id) {
    let found = useImmutableSelector(segment, "data", id);
    let loadAction = useMemo(() => action(Action.LOAD_ONE, id), [id]);
    useLoader(loadAction, !found);
    return found;
}

export function useArticlesPageSize() {
    return usePageSize(segment, "pages");
}

export function useArticlesTotalCount() {
    return useTotalCount(segment, "pages");
}

export function useArticlesLoading() {
    return useLoading(segment);
}

export function useArticleLoading(id) {
    return useImmutableSelector(segment, "loadings", id);
}

export function useArticlesUpdating() {
    return useUpdating(segment);
}

export function useArticlesDeleting() {
    return useDeleting(segment);
}

export function useArticlesError() {
    return useLastError(segment);
}

export function useArticleUpdater() {
    const router = useRouter();
    const updater = useUpdater2(Action.UPDATE);
    return async (id, redirectTo, update, extra = {}) => {
        await updater(update, {...extra, id});
        await router.push(redirectTo);
    }
}

export function useArticlesDeleter() {
    return useDeleter2(Action.DELETE);
}

function* load(page, pageSize, publishedOnly) {
    if (pageSize > MAX_PAGE_SIZE) {
        throw Error(`The requested page size ${pageSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    try {
        let articlesResult = yield call(ArticlesRequests.load, page, pageSize, publishedOnly);
        yield put(action(Action.LOADED, {publishedOnly, ...articlesResult}));
    } catch (e) {
        console.error(`Cannot load article info page = ${page}, page size = ${pageSize}`, e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* remove(articleId, page) {
    try {
        yield call(ArticlesRequests.remove, articleId);
        let pageSize = yield select(pageSizeSelector("articles", "pages"));
        let updatedList = yield call(ArticlesRequests.load, page, pageSize, false);
        yield put(action(Action.DELETED, {...updatedList, deletedId: articleId}));
    } catch (e) {
        console.error(`Exception while deleting article ${articleId}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* loadOne(articleId) {
    try {
        let article = yield call(ArticlesRequests.loadOne, articleId);
        yield put(action(Action.LOADED_ONE, article));
    } catch (e) {
        console.error(`Cannot load article info ${articleId}`, e);
        yield put(error(Action.LOAD_ONE_ERROR, e.toLocaleString(), {id: articleId, error: e}));
    }
}

function* update(articleId, update) {
    try {
        let updated = yield call(ArticlesRequests.update, articleId, update);
        yield put(action(Action.UPDATED, updated));
    } catch (e) {
        console.error(`Exception while updating article ${articleId}`, update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
    }
}

function mergeCache(iCache, articles) {
    const result = {...iCache};
    articles.forEach(a => {
        result[a.id] = a;
    });
    return result;
}

function pageContent(ids, cache) {
    ids = ids || [];
    return ids.map(id => cache[id]);
}

function publishableIds(articles, withUnpublished) {
    return publishableData(articles, withUnpublished, a => a.id);
}
