import {useLastError, useLazyLoader, useLoading} from "../global/hook-barebone";
import {Loading} from "../global/enums";
import {Action} from "./action";
import {segment} from "./segment";

export function useLatestArticles() {
    return useLazyLoader(Action.LOAD, segment);
}

export function useLatestArticlesLoading() {
    return useLoading(segment) || Loading.LOADING;
}

export function useLatestArticlesError() {
    return useLastError(segment);
}
