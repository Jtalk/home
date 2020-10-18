import {immutableSelector, useImmutableSelector} from "../../redux-store";
import merge from "lodash/merge";

export function defaultPages() {
    return {pages: [], total: null, pageSize: null};
}

export function usePage(pageN, segment, ...dataPath) {
    let pages = useImmutableSelector(segment, ...dataPath, "pages");
    return pages[pageN];
}

export function useTotalCount(segment, ...dataPath) {
    return useImmutableSelector(segment, ...dataPath, "total");
}

export function usePageSize(segment, ...dataPath) {
    return useImmutableSelector(segment, ...dataPath, "pageSize");
}

export function pageSizeSelector(segment, ...dataPath) {
    return immutableSelector(segment, ...dataPath, "pageSize");
}

export function addPage(data, newPage, pagination) {
    let existingPageSize = data.pageSize;
    let total = data.total;
    if (pagination.total === total && existingPageSize === pagination.pageSize) {
        // Same size, no change to existing pages
        console.debug(
            `Updating store page ${pagination.current} without size change`,
            `(existing page size=${existingPageSize}, total=${total}`,
            newPage, pagination);
        return merge({}, data, {
            pages: withNewPage(data.pages, newPage, pagination.current),
        })
    } else {
        // Page size has changed, we need to reset existing pages
        console.debug(
            `Updating store page ${pagination.current}`,
            `without size change (existing page size=${existingPageSize}, total=${total}`,
            newPage, pagination);
        return merge({}, data, {
            pages: withNewPage([], newPage, pagination.current),
            total: pagination.total || null,
            pageSize: pagination.pageSize || null
        })
    }
}

function withNewPage(pages, newPage, pageN) {
    const result = [...pages];
    result[pageN] = newPage;
    return result;
}
