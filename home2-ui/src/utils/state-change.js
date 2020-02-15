import {useImmutableSelector} from "./redux-store";
import {useState} from "react";
import _ from "lodash";

export function useStateChange(storeSegment, statePath, {from, to}) {
    let status = useImmutableSelector(storeSegment, ...statePath);
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
        console.debug("State change detected", currentStatus, status, [storeSegment, ...statePath]);
    }
    return [match, status];
}