import { useLoadingStatus } from "../global/swr-common";
import useSWR from "swr";
import { superagentFetch } from "../../ajax";

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
  return useSWR(footerApiUrl, superagentFetch);
}
