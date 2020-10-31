import {useImmutableSelector} from "../../redux-store";
import {Action, segment} from "./index";
import {useDispatch} from "react-redux";
import {useCallback} from "react";
import {action, error} from "../global/actions";
import SearchRequests from "../../ajax/search-requests";
import {Loading} from "../global/enums";

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
