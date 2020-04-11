import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../../../utils/redux-store";
import {action} from "./actions";
import {useEffect} from "react";

export function useLoader(memoAction, enabled) {
    let dispatch = useDispatch();
    useEffect(() => {
        if (enabled) {
            dispatch(memoAction);
        }
    }, [dispatch, enabled, memoAction]);
}

export function useUpdater2(actionType) {
    let dispatch = useDispatch();
    return async (update, extra) => {
        return await dispatch(action(actionType, {update, extra}));
    }
}

export function useDirectUpdater(updater) {
    let dispatch = useDispatch();
    return async (update, extra) => {
        return await dispatch(updater(update, extra));
    }
}

export function useDeleter2(actionType) {
    let dispatch = useDispatch();
    return async (id, extra) => {
        return await dispatch(action(actionType, {id, extra}));
    }
}

export function useDirectDeleter(deleter) {
    let dispatch = useDispatch();
    return async (id, extra) => {
        return await dispatch(deleter(id, extra));
    }
}

export function useLoading(segment, path = ["loading"]) {
    return useImmutableSelector(segment, ...path);
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
