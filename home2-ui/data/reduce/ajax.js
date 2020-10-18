import {select} from "redux-saga/effects";
import {Ajax} from "../ajax-requests";
import {useImmutableSelector} from "../redux-store";
import {HYDRATE} from "next-redux-wrapper";

export function ajax(state = new Ajax(), action) {
    switch (action.type) {
        case HYDRATE:
            // Do nothing, fall through
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
