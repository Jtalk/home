import {Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {useLastError, useLazyLoader, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {HYDRATE} from "next-redux-wrapper";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import {hydrate} from "../redux-store";
import merge from "lodash/merge";

let defaultOwner = {
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: {},
    bio: ""
};

export const Action = {
    LOAD: "owner load",
    LOADED: "owner loaded",
    LOAD_ERROR: "owner load error",
    UPDATE: "owner update",
    UPDATED: "owner updated",
    UPDATE_ERROR: "owner update error",
};

export const segment = "owner";

export function reducer(state = {loading: null, data: defaultOwner, version: 1}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return merge({}, state, {
                loading: Loading.READY, errorMessage: null,
                data: action.data,
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING});
        case Action.UPDATED:
            return merge({}, state, {
                updating: Updating.UPDATED, errorMessage: null,
                data: action.data,
            });
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

export const ownerActions = {
    load: () => ({ type: Action.LOAD, [WAIT_FOR_ACTION]: Action.LOADED, [ERROR_ACTION]: Action.LOAD_ERROR })
}

export function* watchOwner() {
    yield takeEvery(Action.LOAD, () => load());
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update, data.extra.photo));
}

export function useOwner() {
    return useLazyLoader(Action.LOAD, segment) || {};
}

export function useOwnerLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useOwnerUpdating() {
    return useUpdating(segment);
}

export function useOwnerError() {
    return useLastError(segment);
}

export function useOwnerUpdater() {
    return useUpdater2(Action.UPDATE);
}

function* load() {
    console.debug("Loading owner");
    let ajax = yield fetchAjax();
    try {
        let owner = yield call(ajax.owner.load);
        console.debug("Owner loaded", owner);
        yield put(action(Action.LOADED, owner));
    } catch (e) {
        console.error("Cannot load owner info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* update(update, photo) {
    console.info("Updating owner with", update);
    let ajax = yield fetchAjax();
    try {
        let newOwner = yield call(ajax.owner.update, update, photo);
        console.info("Owner updated", newOwner);
        yield put(action(Action.UPDATED, newOwner));
    } catch (e) {
        console.error("Exception while updating owner bio for", update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
    }
}

