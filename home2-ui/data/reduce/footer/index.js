import merge from "lodash/merge";
import {Loading, Updating} from "../global/enums";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";
import {Action} from "./action";
import {segment} from "./segment";

export * from "./action";
export * from "./actions";
export * from "./hooks";
export * from "./saga";
export * from "./segment";

const defaultFooter = {
    links: [],
    logos: [],
};

export default function footer(state = {loading: null, data: defaultFooter}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return {loading: Loading.READY, errorMessage: null, data: action.data};
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING, errorMessage: null});
        case Action.UPDATED:
            return merge({}, state, {updating: Updating.UPDATED, errorMessage: null, data: action.data});
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}
