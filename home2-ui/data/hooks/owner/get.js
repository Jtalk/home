import useSWR from "swr";
import superagentFetch from "../../ajax/fetch";
import useLoadingStatus from "../global/swr-common/loading-status";

export const ownerApiUrl = "/owner";

export function useOwner() {
    return useOwnerLoader().data;
}

export function useOwnerLoader() {
    return useSWR(ownerApiUrl, superagentFetch);
}

export function useOwnerLoading() {
    const state = useOwnerLoader();
    return useLoadingStatus(state);
}

export function useOwnerError() {
    return useOwnerLoader().error;
}
