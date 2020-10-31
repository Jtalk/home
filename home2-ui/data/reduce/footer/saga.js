import {call, put, takeEvery} from "redux-saga/effects";
import {Action} from "./index";
import {load as loadFooter, update as updateFooter} from "../../ajax/footer-requests";
import {action, error} from "../global/actions";

export function* watchFooter() {
    yield takeEvery(Action.LOAD, () => load());
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update));
}

function* load() {
    try {
        let result = yield call(loadFooter);
        yield put(action(Action.LOADED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* update(footer) {
    try {
        let result = yield call(updateFooter, footer);
        yield put(action(Action.UPDATED, result));
    } catch (e) {
        console.error("Cannot load footer info", e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
    }
}
