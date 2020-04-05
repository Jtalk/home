import {useImmutableSelector} from "./redux-store";
import {useState} from "react";
import _ from "lodash";

export function useStateChange(storeSegment, statePath, change) {
    let status = useImmutableSelector(storeSegment, ...statePath);
    return [useLoadedStateChange(status, change), status];
}

export function useLoadedStateChange(status, {from, to}) {
    let [currentStatus, setCurrentStatus] = useState(status);
    from = from && _.castArray(from);
    to = to && _.castArray(to);
    if (_.isEmpty(from) || _.isEmpty(to)) {
        throw Error(`from & to cannot be undefined, but found: ${JSON.stringify({from, to})}`);
    }
    if (status !== currentStatus) {
        setCurrentStatus(status);
    }
    let match = status !== currentStatus && from.includes(currentStatus) && to.includes(status);
    if (match) {
        console.debug("State change detected", currentStatus, status);
    }
    return match;
}