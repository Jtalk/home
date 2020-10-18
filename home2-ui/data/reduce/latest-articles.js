import {fromJS, Map} from "immutable";
import {Loading} from "./global/enums";
import {action, error} from "./global/actions";
import {useLastError, useLazyLoader, useLoading} from "./global/hook-barebone";
import {call, put} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {hydrate, useImmutableSelector} from "../redux-store";
import {HYDRATE} from "next-redux-wrapper";
import {takeEvery} from "@redux-saga/core/effects";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";

const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: "latest articles load",
    LOADED: "latest articles loaded",
    LOAD_ERROR: "latest articles load error",
};

export const segment = "latest-articles";

export function reducer(state = fromJS({loading: null, data: []}), action) {
    switch (action.type) {
        case Action.LOAD:
            return fromJS({loading: Loading.LOADING, errorMessage: null, data: []});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: null, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

export const latestArticlesActions = {
    load: () => ({ type: Action.LOAD, [WAIT_FOR_ACTION]: Action.LOADED, [ERROR_ACTION]: Action.LOAD_ERROR })
}

export function serialiseJSON(state) {
    const result = state.toJS();
    if (result.data) {
        result.data = result.data.map(v => ({...v, created: v.created?.getTime()}));
    }
    return result;
}

export function deserialiseJSON(json) {
    const result = {...json};
    if (result.data) {
        result.data = result.data.map(v => ({...v, created: v.created && new Date(v.created)}));
    }
    return fromJS(result);
}

export function* watchLatestArticles() {
    yield takeEvery(Action.LOAD, () => load(3));
}

export function useLatestArticles() {
    return useLazyLoader(Action.LOAD, segment);
}

export function useLatestArticlesLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useLatestArticlesError() {
    return useLastError(segment);
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
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}
