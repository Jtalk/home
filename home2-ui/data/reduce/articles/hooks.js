import {usePage, usePageSize, useTotalCount} from "../global/paginated-data";
import {Action, segment} from "./index";
import {useImmutableSelector} from "../../redux-store";
import {allSelector, publishedSelector} from "../global/publishable-data";
import {useCallback, useMemo} from "react";
import {action} from "../global/actions";
import {
    useDeleter2,
    useDeleting,
    useLastError,
    useLoader,
    useLoading,
    useUpdater2,
    useUpdating
} from "../global/hook-barebone";
import {useRouter} from "next/router";

export function useArticles(page, pageSize, withUnpublished = false) {
    let existingSize = useArticlesPageSize();
    let existingPage = usePage(page, segment, "pages");
    let data = useImmutableSelector(segment, "data");
    let publishedPage = publishedSelector(null)(existingPage);
    let allPage = allSelector(null)(existingPage);
    let loadAction = useMemo(
        () => action(Action.LOAD, {page, pageSize, publishedOnly: !withUnpublished}),
        [page, pageSize, withUnpublished]);
    useLoader(loadAction, !existingPage || existingSize !== pageSize || (withUnpublished && !allPage));
    return pageContent(withUnpublished ? allPage : publishedPage, data);

}

export function useArticle(id) {
    let found = useImmutableSelector(segment, "data", id);
    let loadAction = useMemo(() => action(Action.LOAD_ONE, id), [id]);
    useLoader(loadAction, !found);
    return found;
}

export function useArticlesPageSize() {
    return usePageSize(segment, "pages");
}

export function useArticlesTotalCount() {
    return useTotalCount(segment, "pages");
}

export function useArticlesLoading() {
    return useLoading(segment);
}

export function useArticleLoading(id) {
    return useImmutableSelector(segment, "loadings", id);
}

export function useArticlesUpdating() {
    return useUpdating(segment);
}

export function useArticlesDeleting() {
    return useDeleting(segment);
}

export function useArticlesError() {
    return useLastError(segment);
}

export function useArticleUpdater() {
    const router = useRouter();
    const updater = useUpdater2(Action.UPDATE);
    return useCallback(async (id, redirectTo, update, extra = {}) => {
        await updater(update, {...extra, id});
        await router.push(redirectTo);
    }, [router, updater]);
}

export function useArticlesDeleter() {
    return useDeleter2(Action.DELETE);
}

function pageContent(ids, cache) {
    ids = ids || [];
    return ids.map(id => cache[id]);
}
