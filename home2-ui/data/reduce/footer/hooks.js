import {useLastError, useLazyLoader, useLoading, useUpdater2, useUpdating} from "../global/hook-barebone";
import {Loading} from "../global/enums";
import {Action} from "./action";
import {segment} from "./segment";

export function useFooter() {
    return useLazyLoader(Action.LOAD, segment);
}

export function useFooterError() {
    return useLastError(segment);
}

export function useFooterLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useFooterUpdating() {
    return useUpdating(segment);
}

export function useFooterUpdater() {
    return useUpdater2(Action.UPDATE);
}
