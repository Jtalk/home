import {useDeleter2, useLastError, useLoader, useLoading, useUpdater2, useUpdating} from "../global/hook-barebone";
import {Action, segment} from "./index";
import {useImmutableSelector} from "../../redux-store";
import {useMemo} from "react";
import {action} from "../global/actions";

export function useImages(page) {
    let images = useImmutableSelector(segment, "data", "pages");
    let loadAction = useMemo(() => action(Action.LOAD, page), [page]);
    useLoader(loadAction, !images[page]);
    return images[page] || [];
}

export function useImagesTotalCount() {
    return useImmutableSelector(segment, "data", "total") || 0;
}

export function useImagesLoading() {
    return useLoading(segment, ["loading", "status"]);
}

export function useImagesUploading() {
    return useUpdating(segment, ["uploading", "status"]);
}

export function useImagesUploadingError() {
    return useLastError(segment, ["uploading", "error", "message"]);
}

export function useImageUploader() {
    return useUpdater2(Action.UPLOAD);
}

export function useImageDeleter() {
    return useDeleter2(Action.DELETE);
}
