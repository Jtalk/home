import {useState, useEffect} from "react";

export function useDependentState(init) {
    let [state, setState] = useState(init);
    useEffect(() => {
        // Avoid double set on first call
        if (state !== init) {
            setState(init);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init]);
    return [state, setState];
}