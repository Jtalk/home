import useSWR from "swr";
import {superagentFetch} from "../ajax/superagent-api";
import {useLoadingStatus, useUpdater} from "../swr-common";

const footerApiUrl = "/footer";

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

export function useFooterUpdater() {
    return useUpdater(footerApiUrl);
}

function useFooterLoader() {
    return useSWR(footerApiUrl, superagentFetch);
}
