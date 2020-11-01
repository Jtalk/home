import useSWR from "swr";
import {useLoadingStatus, useUpdater} from "./global/swr-common";
import {superagentFetch} from "../ajax";

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
