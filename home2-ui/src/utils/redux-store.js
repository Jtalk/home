import {useSelector} from "react-redux";

export function useImmutableSelector(storeSegment, path) {
    let result = useSelector(store => {
        return store && loadAsObj(store[storeSegment], path)
    });
    return (result && result.toJS && result.toJS()) || result;
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
