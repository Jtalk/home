import {useLastError, useLazyLoader, useLoading, useUpdater2, useUpdating} from "../global/hook-barebone";
import {Action, segment} from "./index";
import {Loading} from "../global/enums";

export function useOwner() {
    return useLazyLoader(Action.LOAD, segment) || {};
}

export function useOwnerLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useOwnerUpdating() {
    return useUpdating(segment);
}

export function useOwnerError() {
    return useLastError(segment);
}

export function useOwnerUpdater() {
    return useUpdater2(Action.UPDATE);
}
