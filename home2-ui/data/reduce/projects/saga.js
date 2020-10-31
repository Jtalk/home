import {call, put, takeLatest} from "redux-saga/effects";
import {Action} from "./index";
import ProjectRequests from "../../ajax/projects-requests";
import {action, error} from "../global/actions";

export function* watchProjects() {
    yield takeLatest(Action.LOAD, () => load(true));
    yield takeLatest(Action.RELOAD_UNPUBLISHED, () => load(false));
}

function* load(publishedOnly) {
    try {
        let projects = yield call(ProjectRequests.load, publishedOnly);
        yield put(action(Action.LOADED, {projects, publishedOnly}));
    } catch (e) {
        console.error("Cannot load project info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}
