import {fromJS} from "immutable";
import {Deleting, Loading} from "./global/enums";
import {action, error} from "./global/actions";
import {addPage, defaultPages, pageSizeSelector, usePage, usePageSize, useTotalCount} from "./global/paginated-data";
import {call, put, select, takeEvery, takeLatest} from "redux-saga/effects";
import {useDeleter2, useDeleting, useLoader, useLoading} from "./global/hook-barebone";
import {allSelector, publishableData, publishedSelector} from "./global/publishable-data";
import {fetchAjax} from "./ajax";

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

export function articles(state = fromJS({loading: Loading.INITIAL, data: defaultPages()}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return state.merge({
                loading: Loading.READY, errorMessage: undefined,
                data: addPage(state.get("data"), publishableData(action.data.articles, !action.data.publishedOnly), action.data.pagination)
            });
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return state.merge({deleting: Deleting.DELETING});
        case Action.DELETED:
            return state.merge({
                deleting: Deleting.DELETED, errorMessage: undefined,
                data: addPage(defaultPages(), publishableData(action.data.articles, !action.data.publishedOnly), action.data.pagination)
            });
        case Action.DELETE_ERROR:
            return state.merge({deleting: Deleting.DELETE_ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchArticles() {
    yield takeLatest(Action.LOAD, ({data}) => load(data.page, data.pageSize, data.publishedOnly));
    yield takeEvery(Action.DELETE, ({data}) => remove(data.id, data.page));
}

export function useArticles(page, pageSize, withUnpublished = false) {
    let existingSize = useArticlesPageSize();
    let existingPage = usePage(page, "articles", "data");
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
    return (withUnpublished ? allPage : publishedPage) || [];

}

export function useArticlesPageSize() {
    return usePageSize("articles", "data");
}

export function useArticlesTotalCount() {
    return useTotalCount("articles", "data");
}

export function useArticlesLoading() {
    return useLoading("articles");
}

export function useArticlesDeleting() {
    return useDeleting("articles");
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
        let pageSize = yield select(pageSizeSelector("articles", "data"));
        let updatedList = yield call(ajax.articles.load, page, pageSize, false);
        yield put(action(Action.DELETED, updatedList));
    } catch (e) {
        console.error(`Exception while deleting article ${articleId}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString()));
    }
}
