import {useSelector} from "react-redux";
import {useMemo} from "react";
import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";

export function useImmutableSelector(storeSegment, ...path) {
    // Support deprecated use with supplying an array as path
    if (path.length === 1 && path[0].length !== undefined && typeof path[0] !== "string") {
        path = path[0];
    }
    let result = useSelector(store => {
        return store && loadAsObj(store[storeSegment], path)
    });
    return useMemo(() => cloneDeep(result), [result]);
}

export function immutableSelector(storeSegment, ...path) {
    return store => {
        if (storeSegment) {
            store = store[storeSegment];
        }
        return store && loadAsObj(store, path);
    };
}

export function hydrate(state, action, segment) {
    const payload = action.payload?.[segment];
    console.info(`Hydrate ${segment}: `, payload)
    return merge({}, state, payload);
}

function loadAsObj(store, pathArray) {
    return get(store, pathArray);
}
