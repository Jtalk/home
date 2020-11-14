import useSWR from "swr";
import superagentFetch from "../ajax/fetch";
import useResultMapper from "./global/swr-common/mapper";

export const latestArticlesApiUrl = "/blog/articles?page=0&pageSize=3&published=true";

export function useLatestArticles(previewSize) {
  const result = useSWR(latestArticlesApiUrl, superagentFetch);
  return useResultMapper(result, (data) => data?.data);
}
