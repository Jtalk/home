import merge from "lodash/merge";
import {HYDRATE} from "next-redux-wrapper";

export * from "./hooks";

export const Action = {
    LOADING: "search loading",
    COMPLETE: "search complete",
    ERROR: "search error",
};
export const segment = "search";

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
