import {useDispatch} from "react-redux";
import {useAjax} from "../../../context/ajax-context";
import {useImmutableSelector} from "../../../utils/redux-store";
import {Loading} from "./enums";
import {useEffect} from "react";

export function useData(loader, segment, path = ["data"], loadingPath = ["loading"]) {

    let dispatch = useDispatch();
    let ajax = useAjax();
    let result = useImmutableSelector(segment, path);
    let loading = useLoading(segment, loadingPath);

    useEffect(() => {
        if (loading === Loading.INITIAL) {
            dispatch(loader(ajax));
        }
    }, [loader, dispatch, ajax, loading]);

    return result;
}

export function useUpdater(update) {
    let dispatch = useDispatch();
    let ajax = useAjax();
    return newValue => {
        dispatch(update(ajax, newValue));
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