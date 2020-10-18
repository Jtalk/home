import {action, error} from "./global/actions";
import {Loading} from "./global/enums";
import {useLoader} from "./global/hook-barebone";
import {fetchAjax} from "./ajax";
import {call, put, takeLatest} from "redux-saga/effects";
import {useImmutableSelector} from "../redux-store";
import {useMemo} from "react";
import {HYDRATE} from "next-redux-wrapper";
import merge from "lodash/merge";

export const Action = {
    LOAD: "tags load",
    LOADED: "tags loaded",
    LOAD_ERROR: "tags loading error",
};

export const segment = "tags";

export function reducer(state = {loading: Loading.LOADING, data: null}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return merge({}, state, {loading: Loading.READY, data: action.data});
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            // Admin-only activity, no server-side rendering involved
            return state;
        default:
            return state;
    }
}

export function* watchTags() {
    yield takeLatest(Action.LOAD, load);
}

export function useAvailableTags() {
    let tags = useImmutableSelector(segment, "data");
    let loadAction = useMemo(() => action(Action.LOAD), []);
    useLoader(loadAction, !tags);
    return tags || [];
}

function* load() {
    let ajax = yield fetchAjax();
    try {
        let tags = yield call(ajax.tags.load);
        yield put(action(Action.LOADED, tags));
    } catch (e) {
        console.error("Cannot load tags info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}
