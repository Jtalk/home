import {useState, useEffect} from "react";

export function useDependentState(init, onChanged) {
    let [state, setState] = useState(init);
    useEffect(() => {
        // Avoid double set on first call
        if (state !== init) {
            setState(init);
            onChanged();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init, onChanged]);
    return [state, setState];
}