import useSWR from "swr";
import {superagentFetch} from "../ajax/superagent-api";
import {useLoadingStatus} from "../swr-common";

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
