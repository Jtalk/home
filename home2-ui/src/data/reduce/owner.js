import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import {useLastError, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {call, put, takeEvery} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {useImmutableSelector} from "../../utils/redux-store";

let defaultOwner = fromJS({
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: {},
    bio: ""
});

export const Action = {
    LOAD: Symbol("owner load"),
    LOADED: Symbol("owner loaded"),
    LOAD_ERROR: Symbol("owner load error"),
    UPDATE: Symbol("owner update"),
    UPDATED: Symbol("owner updated"),
    UPDATE_ERROR: Symbol("owner update error"),
};

export function owner(state = Map({loading: Loading.INITIAL, data: defaultOwner}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: defaultOwner});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: action.data});
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchOwner() {
    yield preload();
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update, data.extra.photo));
}

export function useOwner() {
    return useImmutableSelector("owner", "data");
}

export function useOwnerLoading() {
    return useLoading("owner");
}

export function useOwnerUpdating() {
    return useUpdating("owner");
}

export function useOwnerError() {
    return useLastError("owner");
}

export function useOwnerUpdater() {
    return useUpdater2(Action.UPDATE);
}

function* preload() {
    yield put(action(Action.LOAD));
    yield call(load);
}

function* load() {
    let ajax = yield fetchAjax();
    try {
        let owner = yield call(ajax.owner.load);
        yield put(newState(Action.LOADED, fromJS(owner)));
    } catch (e) {
        console.error("Cannot load owner info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* update(update, photo) {
    let ajax = yield fetchAjax();
    try {
        let newOwner = yield call(ajax.owner.update, update, photo);
        yield put(newState(Action.UPDATED, fromJS(newOwner)));
    } catch (e) {
        console.error("Exception while updating owner bio for", update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString()));
    }
}

