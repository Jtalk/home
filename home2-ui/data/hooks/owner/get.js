import useSWR from "swr";
import superagentFetch from "../../ajax/fetch";
import useLoadingStatus from "../global/swr-common/loading-status";
import { usePreloadContext } from "../../preload/context";
import preload from "../../preload/preload";

export const ownerApiUrl = "/owner";

export function useOwner() {
  return useOwnerLoader().data;
}

export function useOwnerLoader() {
  const preload = usePreloadContext();
  return useSWR(ownerApiUrl, superagentFetch, { initialData: preload?.owner });
}

export function useOwnerLoading() {
  const state = useOwnerLoader();
  return useLoadingStatus(state);
}

export function useOwnerError() {
  return useOwnerLoader().error;
}

export async function preloadOwner() {
  return preload("owner", superagentFetch(ownerApiUrl));
}
