import {select} from "redux-saga/effects";
import {Ajax} from "../ajax-requests";
import {useImmutableSelector} from "../redux-store";
import {HYDRATE} from "next-redux-wrapper";

export const segment = "ajax";

export function reducer(state = new Ajax(), action) {
    switch (action.type) {
        case HYDRATE:
            // No need to reconcile, each side has its own.
            return state;
        default:
            return state;
    }
}

export function serialiseJSON(state) {
    return {};
}

export function deserialiseJSON(json) {
    return {};
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
