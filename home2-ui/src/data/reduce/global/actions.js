import {call, take} from "redux-saga/effects";

export function action(action, newData) {
    return {
        type: action,
        data: newData,
    }
}

export function newState(action, newData) {
    return {
        type: action,
        data: newData
    }
}

export function error(action, errorMsg) {
    return {
        type: action,
        errorMessage: errorMsg
    }
}

export function* takeOnce(actionType, fn, ...args) {
    yield take(actionType);
    yield call(fn, ...args);
}