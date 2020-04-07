import {useSelector} from "react-redux";

export function useImmutableSelector(storeSegment, ...path) {
    // Support deprecated use with supplying an array as path
    if (path.length === 1 && path[0].length !== undefined && typeof path[0] !== "string") {
        path = path[0];
    }
    let result = useSelector(store => {
        return store && loadAsObj(store[storeSegment], path)
    });
    return asJs(result);
}

export function immutableSelector(storeSegment, ...path) {
    return store => {
        let result = store && loadAsObj(store[storeSegment], path);
        return asJs(result);
    };
}

function asJs(immutableValue) {
    return (immutableValue && immutableValue.toJS && immutableValue.toJS()) || immutableValue;
}

function loadAsObj(store, pathArray) {
    let current = store;
    pathArray.forEach(item => {
        if (current && !current.get) {
            console.error("Current without a get!", current, store, pathArray);
        }
        current = current && current.get(item)
    });
    return current;
}
