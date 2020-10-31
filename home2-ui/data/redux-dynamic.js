import {useStore} from "react-redux";
import {useMemo} from "react";
import {combineReducers} from "redux";

export function useReducers(...reducers) {
    const store = useStore();
    useMemo(() => {
        store.replaceReducer(combineReducers(...reducers));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, ...reducers])
}
