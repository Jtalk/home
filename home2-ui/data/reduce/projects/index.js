import {Deleting, Loading, Updating} from "../global/enums";
import merge from "lodash/merge";
import {publishableData} from "../global/publishable-data";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";
import {Action} from "./action";
import {segment} from "./segment";

export * from "./action";
export * from "./actions";
export * from "./hooks";
export * from "./saga";
export * from "./segment";

export default function projects(state = {loading: null, data: {}, version: 1}, action) {
    switch (action.type) {
        case Action.LOAD:
            return {loading: Loading.LOADING, errorMessage: null, uploading: null};
        case Action.LOADED:
            return merge({}, state, {
                loading: Loading.READY, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING, errorMessage: null});
        case Action.UPDATED:
            return merge({}, state, {
                updating: Updating.UPDATED, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return merge({}, state, {deleting: Deleting.DELETING, errorMessage: null});
        case Action.DELETED:
            return merge({}, state, {
                deleting: Deleting.DELETED, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.DELETE_ERROR:
            return merge({}, state, {deleting: Deleting.DELETE_ERROR, errorMessage: action.data});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}
