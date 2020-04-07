import {Map} from "immutable";
import {action, error} from "./global/actions";
import {Loading} from "./global/enums";
import {useLoader, useUpdater2} from "./global/hook-barebone";
import {fetchAjax} from "./ajax";
import {call, put, takeLatest} from "redux-saga/effects";
import {useImmutableSelector} from "../../utils/redux-store";

export const Action = {
    LOAD: Symbol("tags load"),
    LOADED: Symbol("tags loaded"),
    LOAD_ERROR: Symbol("tags loading error"),
};

export function tags(state = Map({loading: Loading.INITIAL, data: undefined}), action) {
    switch (action.type) {
        case Action.LOAD:
            return state.merge({loading: Loading.LOADING});
        case Action.LOADED:
            return state.merge({loading: Loading.READY, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function* watchTags() {
    yield takeLatest(Action.LOAD, load);
}

export function useAvailableTags() {
    let tags = useImmutableSelector("tags", "data");
    useLoader(action(Action.LOAD), !tags);
    return tags || [];
}

export function useTagsReloader() {
    return useUpdater2(Action.LOAD);
}

function* load() {
    let ajax = yield fetchAjax();
    try {
        let tags = yield call(ajax.tags.load);
        yield put(action(Action.LOADED, tags));
    } catch (e) {
        console.error("Cannot load tags info", e);
        yield put(error(Action.LOAD_ERROR, e.message));
    }
}