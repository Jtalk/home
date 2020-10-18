import {useImmutableSelector} from "../redux-store";
import {fromJS, List, Map} from "immutable";
import {Loading} from "./global/enums";
import {useDispatch} from "react-redux";
import {useCallback} from "react";
import {action, error} from "./global/actions";
import {ajaxSelector} from "./ajax";
import {HYDRATE} from "next-redux-wrapper";

const Action = {
    LOADING: "search loading",
    COMPLETE: "search complete",
    ERROR: "search error",
};

export const segment = "search";

export function reduce(state = Map({activeCount: 0, results: List()}), action) {
    switch (action.type) {
        case Action.LOADING:
            return state.merge({activeCount: state.get("activeCount") + 1});
        case Action.COMPLETE:
            return state.merge({
                activeCount: Math.max(state.get("activeCount") - 1, 0),
                results: fromJS(action.data),
            });
        case Action.ERROR:
            return state.merge({
                activeCount: Math.max(state.get("activeCount") - 1, 0),
                results: List(),
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
        let ajax = ajaxSelector(getStore());
        dispatch(action(Action.LOADING, query));
        try {
            let results = await ajax.search.search(query, maxResults);
            dispatch(action(Action.COMPLETE, {results, query}));
        } catch (e) {
            console.error(`Error running search for '${query}'`, e);
            dispatch(error(Action.ERROR, e.toLocaleString(), {error: e}));
        }
    }
}
