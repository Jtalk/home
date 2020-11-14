import useSWR from "swr";
import { superagentFetch } from "../../ajax";
import preload from "../../preload/preload";
import { usePreloadContext } from "../../preload/context";
import useResultMapper from "../global/swr-common/mapper";

export const footerApiUrl = "/footer";

export function useFooter() {
  const preload = usePreloadContext();
  const result = useSWR(footerApiUrl, superagentFetch, { initialData: preload?.footer });
  return useResultMapper(result);
}

export async function preloadFooter() {
  return preload("footer", superagentFetch(footerApiUrl));
}
