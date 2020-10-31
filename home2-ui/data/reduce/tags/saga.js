import {call, put, takeLatest} from "redux-saga/effects";
import TagRequests from "../../ajax/tags-requests";
import {action, error} from "../global/actions";
import {Action} from "./action";

export function* watchTags() {
    yield takeLatest(Action.LOAD, load);
}

function* load() {
    try {
        let tags = yield call(TagRequests.load);
        yield put(action(Action.LOADED, tags));
    } catch (e) {
        console.error("Cannot load tags info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}
