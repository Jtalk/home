import useSWR from "swr";
import superagentFetch from "../ajax/fetch";
import useLoadingStatus from "./global/swr-common/loading-status";

const searchApiUrl = "/search";

export function useSearch(query, maxResults = 20) {
    const result = useSWR(query && `${searchApiUrl}?q=${query}&max=${maxResults}`, superagentFetch);
    const loading = useLoadingStatus(result);
    return {results: result.data, loading: query ? loading : null};
}
