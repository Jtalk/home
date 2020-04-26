import {fromJS, Map} from "immutable";
import {Loading} from "./global/enums";
import {action, error} from "./global/actions";
import {useLastError, useLoading} from "./global/hook-barebone";
import {call, put} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {useImmutableSelector} from "../redux-store";

const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: Symbol("latest articles load"),
    LOADED: Symbol("latest articles loaded"),
    LOAD_ERROR: Symbol("latest articles load error"),
};

export function latestArticles(state = fromJS({loading: Loading.LOADING, data: []}), action) {
    switch (action.type) {
        case Action.LOAD:
            return fromJS({loading: Loading.LOADING, errorMessage: undefined, data: []});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchLatestArticles() {
    yield preload();
}

export function useLatestArticles() {
    return useImmutableSelector("latest-articles", "data");
}

export function useLatestArticlesLoading() {
    return useLoading("latest-articles");
}

export function useLatestArticlesError() {
    return useLastError("latest-articles");
}

function* preload() {
    yield put(action(Action.LOAD));
    yield call(load, 3);
}

function* load(previewSize) {
    if (previewSize > MAX_PAGE_SIZE) {
        throw Error(`The requested preview size ${previewSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    let ajax = yield fetchAjax();
    try {
        let {articles} = yield call(ajax.articles.load, 0, previewSize, true);
        yield put(action(Action.LOADED, articles));
    } catch (e) {
        console.error(`Cannot load ${previewSize} latest articles `, e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}
