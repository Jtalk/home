import merge from "lodash/merge";
import {Loading, Updating} from "../global/enums";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../../redux-store";

export * from "./actions";
export * from "./hooks";
export * from "./saga";

let defaultOwner = {
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: {},
    bio: ""
};
export const Action = {
    LOAD: "owner load",
    LOADED: "owner loaded",
    LOAD_ERROR: "owner load error",
    UPDATE: "owner update",
    UPDATED: "owner updated",
    UPDATE_ERROR: "owner update error",
};
export const segment = "owner";

export default function owner(state = {loading: null, data: defaultOwner, version: 1}, action) {
    switch (action.type) {
        case Action.LOAD:
            return merge({}, state, {loading: Loading.LOADING});
        case Action.LOADED:
            return merge({}, state, {
                loading: Loading.READY, errorMessage: null,
                data: action.data,
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING});
        case Action.UPDATED:
            return merge({}, state, {
                updating: Updating.UPDATED, errorMessage: null,
                data: action.data,
            });
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}
