import useUpdater from "../global/swr-common/updater";
import { ownerApiUrl } from "./get";

export function useOwnerUpdater() {
  return useUpdater(ownerApiUrl);
}
