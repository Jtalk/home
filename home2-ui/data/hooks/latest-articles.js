import useSWR from "swr";
import {useLoadingStatus} from "./global/swr-common";
import {superagentFetch} from "../ajax";

const latestArticlesApiUrl = "/blog/articles";

export function useLatestArticles(previewSize) {
    const result = useLatestArticlesLoader(previewSize);
    return result.data;
}

export function useLatestArticlesLoading(previewSize) {
    const result = useLatestArticlesLoader(previewSize);
    return useLoadingStatus(result);
}

function useLatestArticlesLoader(previewSize) {
    return useSWR(`${latestArticlesApiUrl}?page=0&pageSize=${previewSize}&published=true`, superagentFetch);
}
