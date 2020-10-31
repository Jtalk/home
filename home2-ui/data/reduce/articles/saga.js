import {call, put, select, takeEvery, takeLatest} from "redux-saga/effects";
import ArticlesRequests from "../../ajax/articles-requests";
import {action, error} from "../global/actions";
import {pageSizeSelector} from "../global/paginated-data";
import {Action} from "./action";

const MAX_PAGE_SIZE = 100;

export function* watchArticles() {
    yield takeLatest(Action.LOAD, ({data}) => load(data.page, data.pageSize, data.publishedOnly));
    yield takeEvery(Action.LOAD_ONE, ({data}) => loadOne(data));
    yield takeEvery(Action.UPDATE, ({data}) => update(data.extra.id, data.update, data.extra.redirectTo));
    yield takeEvery(Action.DELETE, ({data}) => remove(data.id, data.extra.page));
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
