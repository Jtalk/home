import { useUpdater } from "../global/swr-common";
import { footerApiUrl } from "./get";
import { useCallback } from "react";

export function useFooterUpdater() {
  const { updater: nestedUpdater, error, status } = useUpdater(footerApiUrl);
  const updater = useCallback(
    async (data) => {
      return nestedUpdater(data);
    },
    [nestedUpdater]
  );
  return { updater, error, status };
}
