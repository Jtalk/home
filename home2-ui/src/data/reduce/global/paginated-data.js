import {fromJS, List, Map} from "immutable";
import {immutableSelector, useImmutableSelector} from "../../../utils/redux-store";

export function defaultPages() {
    return Map({pages: List(), total: undefined, pageSize: undefined});
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
    let existingPageSize = data.get("pageSize");
    let total = data.get("total");
    if (pagination.total === total && existingPageSize === pagination.pageSize) {
        // Same size, no change to existing pages
        return data.merge({
            pages: withNewPage(data.get("pages"), newPage, pagination.current),
        })
    } else {
        // Page size has changed, we need to reset existing pages
        return data.merge({
            pages: withNewPage(List(), newPage, pagination.current),
            total: pagination.total,
            pageSize: pagination.pageSize
        })
    }
}

function withNewPage(pages, newPage, pageN) {
    return pages.set(pageN, fromJS(newPage));
}
