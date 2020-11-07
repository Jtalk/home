import useSWR from "swr";
import superagentFetch from "../ajax/fetch";
import useLoadingStatus from "./global/swr-common/loading-status";

export const latestArticlesApiUrl = "/blog/articles?page=0&pageSize=3&published=true";

export function useLatestArticles(previewSize) {
  const result = useLatestArticlesLoader(previewSize);
  return result.data?.data;
}

export function useLatestArticlesLoading(previewSize) {
  const result = useLatestArticlesLoader(previewSize);
  return useLoadingStatus(result);
}

function useLatestArticlesLoader(previewSize) {
  return useSWR(latestArticlesApiUrl, superagentFetch);
}
