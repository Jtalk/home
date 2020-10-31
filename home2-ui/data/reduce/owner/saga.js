import {call, put, takeEvery} from "redux-saga/effects";
import {load as ownerLoad, update as ownerUpdate} from "../../ajax/owner-requests";
import {action, error} from "../global/actions";
import {Action} from "./index";

export function* watchOwner() {
    yield takeEvery(Action.LOAD, () => load());
    yield takeEvery(Action.UPDATE, ({data}) => update(data.update, data.extra.photo));
}

function* load() {
    console.debug("Loading owner");
    try {
        let owner = yield call(ownerLoad);
        console.debug("Owner loaded", owner);
        yield put(action(Action.LOADED, owner));
    } catch (e) {
        console.error("Cannot load owner info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* update(update, photo) {
    console.info("Updating owner with", update);
    try {
        let newOwner = yield call(ownerUpdate, update, photo);
        console.info("Owner updated", newOwner);
        yield put(action(Action.UPDATED, newOwner));
    } catch (e) {
        console.error("Exception while updating owner bio for", update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
    }
}
