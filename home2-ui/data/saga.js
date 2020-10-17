import {all, takeEvery} from "redux-saga/effects"
import {watchOwner} from "./reduce/owner";
import {watchProjects} from "./reduce/projects";
import {watchLatestArticles} from "./reduce/latest-articles";
import {watchAuthentication} from "./reduce/authentication";
import {watchFooter} from "./reduce/footer";
import {watchTags} from "./reduce/tags";
import {watchImages} from "./reduce/images";
import {watchArticles} from "./reduce/articles";
import {reportError} from "../utils/error-reporting";

export function* rootSaga() {
    yield all([
        watchErrors(),
        watchTags(),
        watchOwner(),
        watchFooter(),
        watchImages(),
        watchArticles(),
        watchProjects(),
        watchAuthentication(),
        watchLatestArticles(),
    ]);
}

export function* watchErrors() {
    yield takeEvery(isErrorAction, reportErrorAction);
}

function isErrorAction(action) {
    let result = action.ctx && action.ctx.error;
    result = result || action.errorMessage;
    return !!result;
}

function reportErrorAction(action) {
    if (action.ctx && action.ctx.error) {
        reportError(action.ctx.error);
    } else if (action.errorMessage) {
        reportError({errorClass: "redux", errorMessage: action.errorMessage});
    } else {
        reportError({errorClass: "redux", errorMessage: "unknown"});
    }
}