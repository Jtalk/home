import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../../../utils/redux-store";
import {action} from "./actions";

export function useLoader(action, enabled = true) {
    let dispatch = useDispatch();
    if (enabled) {
        dispatch(action);
    }
}

export function useUpdater2(actionType) {
    let dispatch = useDispatch();
    return (update, extra) => {
        dispatch(action(actionType, {update, extra}));
    }
}

export function useDeleter2(actionType) {
    let dispatch = useDispatch();
    return (id) => {
        dispatch(action(actionType, id));
    }
}

export function useLoading(segment, path = ["loading"]) {
    return useImmutableSelector(segment, path);
}

export function useUpdating(segment, path = ["updating"]) {
    return useImmutableSelector(segment, path);
}

export function useDeleting(segment, path = ["deleting"]) {
    return useImmutableSelector(segment, path);
}

export function useLastError(segment, path = ["errorMessage"]) {
    return useImmutableSelector(segment, path);
}