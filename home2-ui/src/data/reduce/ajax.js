import {put, select} from "redux-saga/effects";
import {newState} from "./global/actions";
import {Ajax} from "../ajax-requests";
import {immutableSelector} from "../../utils/redux-store";

const Action = {
    INIT: Symbol("ajax init")
};

export function ajax(state = {}, action) {
    switch (action.type) {
        case Action.INIT:
            return action.data;
        default:
            return state;
    }
}

export function* fetchAjax() {
    return yield select(immutableSelector("ajax"));
}

export function* initAjax() {
    yield put(newState(Action.INIT, new Ajax()));
}