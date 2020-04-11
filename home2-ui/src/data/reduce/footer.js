import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {useLastError, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {useImmutableSelector} from "../../utils/redux-store";

let defaultFooter = fromJS({
    links: [],
    logos: [],
});

let Action = {
    LOAD: Symbol("footer load"),
    LOADED: Symbol("footer loaded"),
    LOAD_ERROR: Symbol("footer load error"),
    UPDATE: Symbol("footer update"),
    UPDATED: Symbol("footer updated"),
    UPDATE_ERROR: Symbol("footer update error"),
};

export function footer(state = Map({loading: Loading.LOADING, data: defaultFooter}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: fromJS(action.data)});
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchFooter() {
    yield preload();
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update));
}

export function useFooter() {
    return useImmutableSelector("footer", "data");
}

export function useFooterError() {
    return useLastError("footer");
}

export function useFooterLoading() {
    return useLoading("footer");
}

export function useFooterUpdating() {
    return useUpdating("footer");
}

export function useFooterUpdater() {
    return useUpdater2(Action.UPDATE);
}

function* preload() {
    yield put(action(Action.LOAD));
    yield call(load);
}

function* load() {
    let ajax = yield fetchAjax();
    try {
        let result = yield call(ajax.footer.load);
        yield put(action(Action.LOADED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* update(footer) {
    let ajax = yield fetchAjax();
    try {
        let result = yield call(ajax.footer.update, footer);
        yield put(action(Action.UPDATED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString()));
    }
}