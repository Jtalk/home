import {useDispatch} from "react-redux";
import {useAjax} from "../../../context/ajax-context";
import {useImmutableSelector} from "../../../utils/redux-store";
import {useEffect} from "react";

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

export function useUpdater(update) {
    let dispatch = useDispatch();
    let ajax = useAjax();
    return newValue => {
        dispatch(update(ajax, newValue));
    }
}

export function useDeleter(delete_) {
    let dispatch = useDispatch();
    let ajax = useAjax();
    return id => {
        dispatch(delete_(ajax, id));
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