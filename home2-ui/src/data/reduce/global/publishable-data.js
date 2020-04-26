import {fromJS} from "immutable";
import {immutableSelector, useImmutableSelector} from "../../redux-store";

export function publishableData(items, withUnpublished, mapping = v => v) {
    let mappedItems = items.map(mapping);
    if (withUnpublished) {
        let published = items
            .filter(i => i.published)
            .map(mapping);
        return fromJS({
            all: mappedItems,
            published
        });
    } else {
        return fromJS({
            published: mappedItems
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