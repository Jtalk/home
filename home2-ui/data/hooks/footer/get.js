import { useLoadingStatus } from "../global/swr-common";
import useSWR from "swr";
import { superagentFetch } from "../../ajax";
import preload from "../../preload/preload";
import { usePreloadContext } from "../../preload/context";

export const footerApiUrl = "/footer";

export function useFooter() {
  return useFooterLoader().data;
}

export function useFooterError() {
  return useFooterLoader().error;
}

export function useFooterLoading() {
  const state = useFooterLoader();
  return useLoadingStatus(state);
}

function useFooterLoader() {
  const preload = usePreloadContext();
  return useSWR(footerApiUrl, superagentFetch, { initialData: preload?.footer });
}

export async function preloadFooter() {
  return preload("footer", superagentFetch(footerApiUrl));
}
