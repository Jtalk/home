import merge from "lodash/merge";
import {Deleting, Loading, Uploading} from "../global/enums";
import {addPage, defaultPages} from "../global/paginated-data";
import {HYDRATE} from "next-redux-wrapper";

export * from "./hooks";
export * from "./saga";

const initialState = {
    upload: {
        status: null,
        error: null,
    },
    loading: {
        status: null,
        error: null,
    },
    data: defaultPages(),
};
export const Action = {
    INIT: "images init",
    LOAD: "images loading",
    LOADED: "images loaded",
    LOAD_ERROR: "images load error",
    UPLOAD: "images uploading",
    UPLOADED: "images uploaded",
    UPLOAD_ERROR: "images upload error",
    DELETE: "images delete",
    DELETED: "images deleted",
    DELETE_ERROR: "images delete error",
};
export const segment = "images";

export default function images(state = initialState, action) {
    switch (action.type) {
        case Action.INIT:
            return merge({}, state, {loading: null, uploading: null, deletion: null});
        case Action.LOAD:
            return merge({}, state, {loading: {status: Loading.LOADING}});
        case Action.LOADED:
            return merge({}, state, {
                loading: {status: Loading.READY},
                data: addPage(state.data, action.data.images, action.data.pagination),
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: {status: Loading.ERROR, error: {message: action.errorMessage}}});
        case Action.UPLOAD:
            return merge({}, state, {uploading: {status: Uploading.UPLOADING}, deleting: null});
        case Action.UPLOADED:
            return merge({}, state, {uploading: {status: Uploading.UPLOADED}, data: defaultPages()});
        case Action.UPLOAD_ERROR:
            return merge({}, state, {uploading: {status: Uploading.ERROR, error: {message: action.errorMessage}}});
        case Action.DELETE:
            return merge({}, state, {deletion: {status: Deleting.DELETING}, uploading: null});
        case Action.DELETED:
            return merge({}, state, {deletion: {status: Deleting.DELETED}, data: defaultPages()});
        case Action.DELETE_ERROR:
            return merge({}, state, {
                deletion: {
                    status: Deleting.DELETE_ERROR, error: {message: action.errorMessage}
                }
            });
        case HYDRATE:
            // Admin-only activity, no server-side rendering involved
            return state;
        default:
            return state;
    }
}
