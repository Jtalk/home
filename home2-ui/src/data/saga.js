import {all} from "redux-saga/effects"
import {watchOwner} from "./reduce/owner";
import {initAjax} from "./reduce/ajax";
import {watchProjects} from "./reduce/projects";

export function* rootSaga() {
    yield all([
        initAjax(),
        watchOwner(),
        watchProjects(),
    ]);
}