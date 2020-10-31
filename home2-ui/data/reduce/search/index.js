import merge from "lodash/merge";
import {HYDRATE} from "next-redux-wrapper";
import {Action} from "./action";

export * from "./action";
export * from "./hooks";
export * from "./segment";

export default function search(state = {activeCount: 0, results: []}, action) {
    switch (action.type) {
        case Action.LOADING:
            return merge({}, state, {activeCount: state.activeCount + 1});
        case Action.COMPLETE:
            return merge({}, state, {
                activeCount: Math.max(state.activeCount - 1, 0),
                results: action.data,
            });
        case Action.ERROR:
            return merge({}, state, {
                activeCount: Math.max(state.activeCount - 1, 0),
                results: [],
                errorMessage: action.errorMessage,
            });
        case HYDRATE:
            // Admin-only activity, no server-side rendering involved
            return state;
        default:
            return state;
    }
}
