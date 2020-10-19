import {useLastError, useLazyLoader, useLoading} from "../global/hook-barebone";
import {Action, segment} from "./reducer";
import {Loading} from "../global/enums";

export function useLatestArticles() {
    return useLazyLoader(Action.LOAD, segment);
}

export function useLatestArticlesLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useLatestArticlesError() {
    return useLastError(segment);
}
