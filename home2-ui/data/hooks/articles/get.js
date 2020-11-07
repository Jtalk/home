import useSWR from "swr";
import { articlesApiUrl } from "./list";
import useLoadingStatus from "../global/swr-common/loading-status";
import superagentFetch from "../../ajax/fetch";
import preload from "../../preload/preload";
import { usePreloadContext } from "../../preload/context";

export function useArticle(id) {
  const { data } = useArticleLoader(id);
  return data;
}

export function useArticleLoader(id) {
  const preload = usePreloadContext();
  return useSWR(id && `${articlesApiUrl}/${id}`, superagentFetch, { initialData: preload?.article?.[id] });
}

export function useArticleLoading(id) {
  const result = useArticleLoader(id);
  return useLoadingStatus(result);
}

export async function preloadArticle(id) {
  const data = await preload("article", superagentFetch(`${articlesApiUrl}/${id}`));
  return { [id]: data };
}
