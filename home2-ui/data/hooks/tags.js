import useSWR from "swr";
import superagentFetch from "../ajax/fetch";

const knownTagsApiUrl = "/blog/tags";

export function useAvailableTags() {
  const result = useAvailableTagsLoader();
  return result.data;
}

function useAvailableTagsLoader() {
  return useSWR(knownTagsApiUrl, superagentFetch);
}
