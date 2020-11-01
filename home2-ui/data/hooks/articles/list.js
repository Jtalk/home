import useSWR from "swr";
import useLoadingStatus from "../global/swr-common/loading-status";

export const articlesApiUrl = "/blog/articles";

export function useArticles(page, pageSize, withUnpublished = false) {
    const {data} = useArticlesLoader(page, pageSize, withUnpublished);
    return data?.data;
}

export function useArticlesLoader(page, pageSize, withUnpublished) {
    return useSWR(`${articlesApiUrl}?page=${page}&pageSize=${pageSize}&published=${!withUnpublished}`);
}

export function useArticlesTotalCount(page, pageSize, withUnpublished = false) {
    const {data} = useArticlesLoader(page, pageSize, withUnpublished);
    return data?.pagination?.total;
}

export function useArticlesLoading(page, pageSize, withUnpublished = false) {
    const result = useArticlesLoader(page, pageSize, withUnpublished);
    return useLoadingStatus(result);
}
