import {useDispatch} from "react-redux";
import {useAjax} from "../../../context/ajax-context";
import {useImmutableSelector} from "../../../utils/redux-store";
import {useEffect} from "react";
import {action} from "./actions";

export function useData(loader, loaderArgs, segment, path = ["data"], loadingPath = ["loading"]) {

    let dispatch = useDispatch();
    let ajax = useAjax();
    let result = useImmutableSelector(segment, path);

    loaderArgs = [ajax, ...loaderArgs];

    useEffect(() => {
        dispatch(loader.apply(this, loaderArgs));
        // Trust me, i'm an engineer
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loader, dispatch, ...loaderArgs]);

    return result;
}

export function useLoader(action, enabled = true) {
    let dispatch = useDispatch();
    if (enabled) {
        dispatch(action);
    }
}

export function useUpdater(update) {
    let dispatch = useDispatch();
    let ajax = useAjax();
    // Extras are here for the useForm hook, that provides uploads as a second argument.
    return (...args) => {
        dispatch(update(ajax, ...args));
    }
}

export function useUpdater2(actionType) {
    let dispatch = useDispatch();
    return (update, extra) => {
        dispatch(action(actionType, {update, extra}));
    }
}

export function useDeleter(delete_) {
    let dispatch = useDispatch();
    let ajax = useAjax();
    return (...args) => {
        dispatch(delete_(ajax, ...args));
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