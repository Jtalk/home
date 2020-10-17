import {select} from "redux-saga/effects";
import {Ajax} from "../ajax-requests";
import {useImmutableSelector} from "../redux-store";

const Action = {
    INIT: Symbol("ajax init")
};

export function ajax(state = new Ajax(), action) {
    switch (action.type) {
        case Action.INIT:
            return action.data;
        default:
            return state;
    }
}

export function* fetchAjax() {
    return yield select(store => store["ajax"]);
}

export function ajaxSelector(state) {
    return state.ajax;
}

export function useAjax() {
    return useImmutableSelector("ajax");
}
