import useSWR from "swr";
import useLoadingStatus from "../global/swr-common/loading-status";
import superagentFetch from "../../ajax/fetch";
import preload from "../../preload/preload";
import { DEFAULT_PAGE_SIZE } from "./constant";
import { usePreloadContext } from "../../preload/context";

export const articlesApiUrl = "/blog/articles";

export function useArticles(page, pageSize, withUnpublished = false) {
  const { data } = useArticlesLoader(page, pageSize, withUnpublished);
  return data?.data;
}

export function useArticlesLoader(page, pageSize, withUnpublished) {
  const preload = usePreloadContext();
  return useSWR(articlesUrl(page, pageSize, withUnpublished), superagentFetch, {
    initialData: preload?.articles?.[page]?.[pageSize],
  });
}

export function useArticlesTotalCount(page, pageSize, withUnpublished = false) {
  const { data } = useArticlesLoader(page, pageSize, withUnpublished);
  return data?.pagination?.total;
}

export function useArticlesLoading(page, pageSize, withUnpublished = false) {
  const result = useArticlesLoader(page, pageSize, withUnpublished);
  return useLoadingStatus(result);
}

export async function preloadArticles(page) {
  const data = await preload("articles", superagentFetch(articlesUrl(page, DEFAULT_PAGE_SIZE, false)));
  return { [page]: { [DEFAULT_PAGE_SIZE]: data } };
}

function articlesUrl(page, pageSize, withUnpublished) {
  return `${articlesApiUrl}?page=${page}&pageSize=${pageSize}&published=${!withUnpublished}`;
}
