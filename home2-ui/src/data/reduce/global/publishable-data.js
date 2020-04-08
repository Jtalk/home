import {fromJS} from "immutable";
import {immutableSelector, useImmutableSelector} from "../../../utils/redux-store";

export function publishableData(items, withUnpublished) {
    if (withUnpublished) {
        let published = items.filter(i => i.published);
        return fromJS({
            all: items,
            published
        });
    } else {
        return fromJS({
            published: items
        });
    }
}

export function usePublishedData(segment, ...dataPath) {
    return useImmutableSelector(segment, ...dataPath, "published");
}

export function useAllData(segment, ...dataPath) {
    return useImmutableSelector(segment, ...dataPath, "all");
}

export function publishedSelector(segment, ...dataPath) {
    return immutableSelector(segment, ...dataPath, "published");
}

export function allSelector(segment, ...dataPath) {
    return immutableSelector(segment, ...dataPath, "all");
}