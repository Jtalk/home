import {Loading} from "../global/enums";
import merge from "lodash/merge";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";

export const Action = {
    LOAD: "latest articles load",
    LOADED: "latest articles loaded",
    LOAD_ERROR: "latest articles load error",
};
export const segment = "latest-articles";

export function reducer(state = {loading: null, data: []}, action) {
    switch (action.type) {
        case Action.LOAD:
            return {loading: Loading.LOADING, errorMessage: null, data: []};
        case Action.LOADED:
            return {loading: Loading.READY, errorMessage: null, data: action.data};
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

export function serialiseJSON(state) {
    const result = {...state};
    if (result.data) {
        result.data = result.data.map(v => ({...v, created: v.created?.getTime()}));
    }
    return result;
}

export function deserialiseJSON(json) {
    const result = {...json};
    if (result.data) {
        result.data = result.data.map(v => ({...v, created: v.created && new Date(v.created)}));
    }
    return result;
}
