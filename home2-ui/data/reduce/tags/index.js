import {Loading} from "../global/enums";
import merge from "lodash/merge";
import {HYDRATE} from "next-redux-wrapper";
import {Action} from "./action";

export * from "./action";
export * from "./hooks";
export * from "./saga";
export * from "./segment";

export default function tags(state = {loading: Loading.LOADING, data: null}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return merge({}, state, {loading: Loading.READY, data: action.data});
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            // Admin-only activity, no server-side rendering involved
            return state;
        default:
            return state;
    }
}
