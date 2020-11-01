import {useCallback, useMemo} from "react";
import useSWR from "swr/esm/use-swr";
import {useDeleter, useLoadingStatus, useUpdater} from "../../swr-common";

const articlesApiUrl = "/blog/articles";

export function useArticles(page, pageSize, withUnpublished = false) {
    const {data} = useArticlesLoader(page, pageSize, withUnpublished);
    return data?.data;
}

export function useArticle(id) {
    const {data} = useArticleLoader(id);
    return data;
}

export function useArticlesTotalCount(page, pageSize, withUnpublished = false) {
    const {data} = useArticlesLoader(page, pageSize, withUnpublished);
    return data?.pagination?.total;
}

export function useArticlesLoading(page, pageSize, withUnpublished = false) {
    const result = useArticlesLoader(page, pageSize, withUnpublished);
    return useLoadingStatus(result);
}

export function useArticleLoading(id) {
    const result = useArticleLoader(id);
    return useLoadingStatus(result);
}

export function useArticleUpdater() {
    const result = useUpdater(articlesApiUrl);
    const {updater: nestedUpdater} = result;
    const updater = useCallback(async (id, update) => {
        if (!id) {
            console.error(`Cannot update article without ID`);
            return;
        }
        await nestedUpdater(update, `${articlesApiUrl}/${id}`);
    }, [nestedUpdater]);
    return useMemo(() => ({...result, updater}), [result, updater]);
}

export function useArticlesDeleter() {
    const result = useDeleter(articlesApiUrl);
    const {deleter: nestedDeleter} = result;
    const deleter = useCallback(async id => {
        if (!id) {
            console.error(`Cannot delete article without ID`);
            return;
        }
        return nestedDeleter(`${articlesApiUrl}/${id}`);
    }, [nestedDeleter]);
    return useMemo(() => ({...result, deleter}), [deleter, result]);
}

function useArticlesLoader(page, pageSize, withUnpublished) {
    return useSWR(`${articlesApiUrl}?page=${page}&pageSize=${pageSize}&published=${!withUnpublished}`);
}

function useArticleLoader(id) {
    return useSWR(id && `${articlesApiUrl}/${id}`);
}
