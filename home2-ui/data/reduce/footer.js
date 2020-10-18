import {Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {useLastError, useLazyLoader, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {hydrate} from "../redux-store";
import {HYDRATE} from "next-redux-wrapper";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import merge from "lodash/merge";

let defaultFooter = {
    links: [],
    logos: [],
};

export const Action = {
    LOAD: "footer load",
    LOADED: "footer loaded",
    LOAD_ERROR: "footer load error",
    UPDATE: "footer update",
    UPDATED: "footer updated",
    UPDATE_ERROR: "footer update error",
};

export const segment = "footer";

export function reducer(state = {loading: null, data: defaultFooter}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return {loading: Loading.READY, errorMessage: null, data: action.data};
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING, errorMessage: null});
        case Action.UPDATED:
            return merge({}, state, {updating: Updating.UPDATED, errorMessage: null, data: action.data});
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

export const footerActions = {
    load: () => ({ type: Action.LOAD, [WAIT_FOR_ACTION]: Action.LOADED, [ERROR_ACTION]: Action.LOAD_ERROR })
}

export function* watchFooter() {
    yield takeEvery(Action.LOAD, () => load());
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update));
}

export function useFooter() {
    return useLazyLoader(Action.LOAD, segment);
}

export function useFooterError() {
    return useLastError(segment);
}

export function useFooterLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useFooterUpdating() {
    return useUpdating(segment);
}

export function useFooterUpdater() {
    return useUpdater2(Action.UPDATE);
}

function* load() {
    let ajax = yield fetchAjax();
    try {
        let result = yield call(ajax.footer.load);
        yield put(action(Action.LOADED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* update(footer) {
    let ajax = yield fetchAjax();
    try {
        let result = yield call(ajax.footer.update, footer);
        yield put(action(Action.UPDATED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
    }
}
