import useSWR from "swr";
import { articlesApiUrl } from "./list";
import superagentFetch from "../../ajax/fetch";
import preload from "../../preload/preload";
import { usePreloadContext } from "../../preload/context";
import useResultMapper from "../global/swr-common/mapper";

export function useArticle(id) {
  const preload = usePreloadContext();
  const result = useSWR(id && `${articlesApiUrl}/${id}`, superagentFetch, { initialData: preload?.article?.[id] });
  return useResultMapper(result);
}

export async function preloadArticle(id) {
  const data = await preload("article", superagentFetch(`${articlesApiUrl}/${id}`));
  return { [id]: data };
}
