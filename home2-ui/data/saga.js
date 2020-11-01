import {all, takeEvery} from "redux-saga/effects"
import {reportError} from "../utils/error-reporting";

export function* rootSaga() {
    yield all([
        watchErrors(),
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
