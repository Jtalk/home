import {Loading} from "../global/enums";
import merge from "lodash/merge";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";

export * from "./actions";
export * from "./hooks";
export * from "./saga";

export const Action = {
    LOAD: "latest articles load",
    LOADED: "latest articles loaded",
    LOAD_ERROR: "latest articles load error",
};
export const segment = "latest-articles";

export default function latestArticles(state = {loading: null, data: []}, action) {
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
