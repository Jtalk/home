import useSWR from "swr";
import superagentFetch from "../../ajax/fetch";
import preload from "../../preload/preload";
import { DEFAULT_PAGE_SIZE } from "./constant";
import { usePreloadContext } from "../../preload/context";
import usePaginatedResultMapper from "../global/swr-common/paginated-mapper";

export const articlesApiUrl = "/blog/articles";

export function useArticles(page, pageSize, withUnpublished = false) {
  const preload = usePreloadContext();
  const result = useSWR(articlesUrl(page, pageSize, withUnpublished), superagentFetch, {
    initialData: preload?.articles?.[page]?.[pageSize],
  });
  return usePaginatedResultMapper(result);
}

export async function preloadArticles(page) {
  const data = await preload("articles", superagentFetch(articlesUrl(page, DEFAULT_PAGE_SIZE, false)));
  return { [page]: { [DEFAULT_PAGE_SIZE]: data } };
}

function articlesUrl(page, pageSize, withUnpublished) {
  return `${articlesApiUrl}?page=${page}&pageSize=${pageSize}&published=${!withUnpublished}`;
}
