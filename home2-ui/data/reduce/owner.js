import useSWR from "swr";
import {superagentFetch} from "../ajax/superagent-api";
import {useLoadingStatus, useUpdater} from "../swr-common";

const ownerApiUrl = "/owner";

export function useOwner() {
    return useOwnerLoader().data;
}

export function useOwnerLoading() {
    const state = useOwnerLoader();
    return useLoadingStatus(state);
}

export function useOwnerError() {
    return useOwnerLoader().error;
}

export function useOwnerUpdater() {
    return useUpdater(ownerApiUrl);
}

function useOwnerLoader() {
    return useSWR(ownerApiUrl, superagentFetch);
}
