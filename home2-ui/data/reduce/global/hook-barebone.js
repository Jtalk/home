import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../../redux-store";
import {action} from "./actions";
import {useCallback, useEffect} from "react";

export function useLoader(memoAction, enabled) {
    let dispatch = useDispatch();
    useEffect(() => {
        if (enabled) {
            console.debug(`Triggering load with`, memoAction);
            dispatch(memoAction);
        }
    }, [dispatch, enabled, memoAction]);
}

export function useUpdater2(actionType) {
    let dispatch = useDispatch();
    return useCallback(async (update, extra) => {
        console.info("Running update action", actionType);
        return await dispatch(action(actionType, {update, extra}));
    }, [dispatch, actionType]);
}

export function useDirectUpdater(updater) {
    let dispatch = useDispatch();
    return useCallback(async (update, extra) => {
        console.info("Running direct update action");
        return await dispatch(updater(update, extra));
    }, [dispatch, updater]);
}

export function useDeleter2(actionType) {
    let dispatch = useDispatch();
    return useCallback(async (id, extra) => {
        console.info("Running delete action", actionType);
        return await dispatch(action(actionType, {id, extra}));
    }, [dispatch, actionType]);
}

export function useDirectDeleter(deleter) {
    let dispatch = useDispatch();
    return useCallback(async (id, extra) => {
        console.info("Running direct delete action");
        return await dispatch(deleter(id, extra));
    }, [dispatch, deleter]);
}

export function useLoading(segment, path = ["loading"]) {
    return useImmutableSelector(segment, ...path);
}

export function useLazyLoader(loadAction, segment, path = ["data"], loadingPath = ["loading"]) {
    const dispatch = useDispatch();
    const loading = useLoading(segment, loadingPath);
    useEffect(() => {
        if (!loading) dispatch({ type: loadAction });
    }, [loadAction, loading, dispatch]);
    return useImmutableSelector(segment, path);
}

export function useUpdating(segment, path = ["updating"]) {
    return useImmutableSelector(segment, ...path);
}

export function useDeleting(segment, path = ["deleting"]) {
    return useImmutableSelector(segment, ...path);
}

export function useLastError(segment, path = ["errorMessage"]) {
    return useImmutableSelector(segment, ...path);
}
