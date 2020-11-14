import useSWR from "swr";
import superagentFetch from "../ajax/fetch";
import useResultMapper from "./global/swr-common/mapper";

const knownTagsApiUrl = "/blog/tags";

export function useAvailableTags() {
  const result = useSWR(knownTagsApiUrl, superagentFetch);
  return useResultMapper(result);
}
