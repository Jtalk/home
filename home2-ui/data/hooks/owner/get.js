import useSWR from "swr";
import superagentFetch from "../../ajax/fetch";
import { usePreloadContext } from "../../preload/context";
import preload from "../../preload/preload";
import useResultMapper from "../global/swr-common/mapper";

export const ownerApiUrl = "/owner";

export function useOwner() {
  const preload = usePreloadContext();
  const result = useSWR(ownerApiUrl, superagentFetch, { initialData: preload?.owner });
  return useResultMapper(result);
}

export async function preloadOwner() {
  return preload("owner", superagentFetch(ownerApiUrl));
}
