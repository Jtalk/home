import useSWR from "swr";
import {useLoadingStatus} from "./global/swr-common";
import {superagentFetch} from "../ajax";

const searchApiUrl = "/search";

export function useSearch(query, maxResults = 20) {
    const result = useSWR(query && `${searchApiUrl}?q=${query}&max=${maxResults}`, superagentFetch);
    const loading = useLoadingStatus(result);
    return {results: result.data, loading};
}
