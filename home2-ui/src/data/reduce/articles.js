import {fromJS, Map} from "immutable";
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
import {fetchAjax} from "./ajax";
import {useImmutableSelector} from "../../utils/redux-store";

export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: Symbol("articles load"),
    LOADED: Symbol("articles loaded"),
    LOAD_ONE: Symbol("single article load"),
    LOADED_ONE: Symbol("single article loaded"),
    LOAD_ERROR: Symbol("articles load error"),
    UPDATE: Symbol("article update"),
    UPDATED: Symbol("article updated"),
    UPDATE_ERROR: Symbol("article update error"),
    DELETE: Symbol("articles delete"),
    DELETED: Symbol("articles deleted"),
    DELETE_ERROR: Symbol("articles delete error"),
};

export function articles(state = fromJS({
    loading: Loading.INITIAL, data: Map(), pages: defaultPages()
}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return state.merge({
                loading: Loading.READY, errorMessage: undefined,
                data: mergeCache(state.get("data"), action.data.articles),
                pages: addPage(state.get("pages"), publishableIds(action.data.articles, !action.data.publishedOnly), action.data.pagination),
            });
        case Action.LOAD_ONE:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED_ONE:
            return state.merge({
                loading: Loading.READY, errorMessage: undefined,
                data: mergeCache(state.get("data"), [action.data])
            });
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({
                updating: Updating.UPDATED, errorMessage: undefined,
                data: mergeCache(Map(), [action.data]),
                pages: defaultPages(),
            });
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return state.merge({deleting: Deleting.DELETING});
        case Action.DELETED:
            return state.merge({
                deleting: Deleting.DELETED, errorMessage: undefined,
                data: mergeCache(Map(), action.data.articles),
                pages: addPage(defaultPages(), publishableIds(action.data.articles, !action.data.publishedOnly), action.data.pagination),
            });
        case Action.DELETE_ERROR:
            return state.merge({deleting: Deleting.DELETE_ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchArticles() {
    yield takeLatest(Action.LOAD, ({data}) => load(data.page, data.pageSize, data.publishedOnly));
    yield takeEvery(Action.LOAD_ONE, ({data}) => loadOne(data));
    yield takeEvery(Action.UPDATE, ({data}) => update(data.extra.id, data.update));
    yield takeEvery(Action.DELETE, ({data}) => remove(data.id, data.page));
}

export function useArticles(page, pageSize, withUnpublished = false) {
    let existingSize = useArticlesPageSize();
    let existingPage = usePage(page, "articles", "pages");
    let data = useImmutableSelector("articles", "data");
    let publishedPage = publishedSelector(null)(fromJS(existingPage));
    let allPage = allSelector(null)(fromJS(existingPage));

    let loading = useArticlesLoading();
    useLoader(action(Action.LOAD, {page, pageSize, publishedOnly: !withUnpublished}),
        loading !== Loading.ERROR
        && (
            !existingPage
            || existingSize !== pageSize
            || (withUnpublished && !allPage)
        ));
    return pageContent(withUnpublished ? allPage : publishedPage, data);

}

export function useArticle(id) {
    let found = useImmutableSelector("articles", "data", id);
    let loading = useArticlesLoading();
    useLoader(action(Action.LOAD_ONE, id), loading !== Loading.ERROR && !found);
    return found;
}

export function useArticlesPageSize() {
    return usePageSize("articles", "pages");
}

export function useArticlesTotalCount() {
    return useTotalCount("articles", "pages");
}

export function useArticlesLoading() {
    return useLoading("articles");
}

export function useArticlesUpdating() {
    return useUpdating("articles");
}

export function useArticlesDeleting() {
    return useDeleting("articles");
}

export function useArticlesError() {
    return useLastError("articles");
}

export function useArticleUpdater() {
    return useUpdater2(Action.UPDATE);
}

export function useArticlesDeleter() {
    return useDeleter2(Action.DELETE);
}

function* load(page, pageSize, publishedOnly) {
    if (pageSize > MAX_PAGE_SIZE) {
        throw Error(`The requested page size ${pageSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    let ajax = yield fetchAjax();
    try {
        let articlesResult = yield call(ajax.articles.load, page, pageSize, publishedOnly);
        yield put(action(Action.LOADED, {publishedOnly, ...articlesResult}));
    } catch (e) {
        console.error(`Cannot load article info page = ${page}, page size = ${pageSize}`, e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* remove(articleId, page) {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.articles.remove, articleId);
        let pageSize = yield select(pageSizeSelector("articles", "pages"));
        let updatedList = yield call(ajax.articles.load, page, pageSize, false);
        yield put(action(Action.DELETED, {...updatedList, deletedId: articleId}));
    } catch (e) {
        console.error(`Exception while deleting article ${articleId}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString()));
    }
}

function* loadOne(articleId) {
    let ajax = yield fetchAjax();
    try {
        let article = yield call(ajax.articles.loadOne, articleId);
        yield put(action(Action.LOADED_ONE, article));
    } catch (e) {
        console.error(`Cannot load article info ${articleId}`, e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* update(articleId, update) {
    let ajax = yield fetchAjax();
    try {
        let updated = yield call(ajax.articles.update, articleId, update);
        yield put(action(Action.UPDATED, updated));
    } catch (e) {
        console.error(`Exception while updating article ${articleId}`, update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString()));
    }
}

function mergeCache(iCache, articles) {
    articles.forEach(a => {
        iCache = iCache.set(a.id, fromJS(a));
    });
    return iCache;
}

function pageContent(ids, cache) {
    ids = ids || [];
    return ids.map(id => cache[id]);
}

function publishableIds(articles, withUnpublished) {
    return publishableData(articles, withUnpublished, a => a.id);
}