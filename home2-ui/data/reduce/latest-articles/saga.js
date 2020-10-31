import {takeEvery} from "@redux-saga/core/effects";
import {Action} from "./index";
import {call, put} from "redux-saga/effects";
import {load as loadArticles} from "../../ajax/articles-requests";
import {action, error} from "../global/actions";

const MAX_PAGE_SIZE = 100;

export function* watchLatestArticles() {
    yield takeEvery(Action.LOAD, () => load(3));
}

function* load(previewSize) {
    if (previewSize > MAX_PAGE_SIZE) {
        throw Error(`The requested preview size ${previewSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    try {
        let {articles} = yield call(loadArticles, 0, previewSize, true);
        yield put(action(Action.LOADED, articles));
    } catch (e) {
        console.error(`Cannot load ${previewSize} latest articles `, e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}
