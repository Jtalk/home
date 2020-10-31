import {all, takeEvery} from "redux-saga/effects"
import {watchOwner} from "./reduce/owner/saga";
import {watchProjects} from "./reduce/projects/saga";
import {watchTags} from "./reduce/tags/saga";
import {watchImages} from "./reduce/images/saga";
import {watchArticles} from "./reduce/articles/saga";
import {reportError} from "../utils/error-reporting";
import {watchFooter} from "./reduce/footer/saga";
import {watchLatestArticles} from "./reduce/latest-articles/saga";
import {watchAuthentication} from "./reduce/authentication/saga";

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
