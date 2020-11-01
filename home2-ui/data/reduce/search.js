import useSWR from "swr";
import {superagentFetch} from "../ajax/superagent-api";
import {useLoadingStatus} from "../swr-common";

const searchApiUrl = "/search";

export function useSearch(query, maxResults = 20) {
    const result = useSWR(query && `${searchApiUrl}?q=${query}&max=${maxResults}`, superagentFetch);
    const loading = useLoadingStatus(result);
    return {results: result.data, loading};
}
