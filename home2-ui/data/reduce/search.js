import {useImmutableSelector} from "../redux-store";
import {Loading} from "./global/enums";
import {useDispatch} from "react-redux";
import {useCallback} from "react";
import {action, error} from "./global/actions";
import {HYDRATE} from "next-redux-wrapper";
import merge from "lodash/merge";
import SearchRequests from "../ajax/search-requests";

const Action = {
    LOADING: "search loading",
    COMPLETE: "search complete",
    ERROR: "search error",
};

export const segment = "search";

export function reducer(state = {activeCount: 0, results: []}, action) {
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

export function useSearch() {
    let dispatch = useDispatch();
    return useCallback((query, maxResults) => dispatch(doSearch(query, maxResults)), [dispatch]);
}

export function useSearchResults() {
    return useImmutableSelector(segment, "results", "results");
}

export function useSearchQuery() {
    return useImmutableSelector(segment, "results", "query");
}

export function useSearchStatus() {
    return useImmutableSelector(segment, "activeCount") > 0
        ? Loading.LOADING
        : Loading.READY
}

export function useSearchError() {
    return useImmutableSelector(segment, "errorMessage");
}

function doSearch(query, maxResults) {
    return async (dispatch, getStore) => {
        dispatch(action(Action.LOADING, query));
        try {
            let results = await SearchRequests.search(query, maxResults);
            dispatch(action(Action.COMPLETE, {results, query}));
        } catch (e) {
            console.error(`Error running search for '${query}'`, e);
            dispatch(error(Action.ERROR, e.toLocaleString(), {error: e}));
        }
    }
}
