import {useUpdater} from "../global/swr-common";
import {footerApiUrl} from "./get";

export function useFooterUpdater() {
    return useUpdater(footerApiUrl);
}
