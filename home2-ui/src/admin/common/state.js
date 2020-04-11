import {useState} from "react";

export function useVersionedState(initial, version, onReset) {
    const [data, setData] = useState(initial);
    const [currentVersion, setCurrentVersion] = useState(version);
    if (version !== currentVersion) {
        console.debug("Resetting the value with new version", version);
        setData(initial);
        setCurrentVersion(version);
        onReset();
    }
    return [data, setData];
}