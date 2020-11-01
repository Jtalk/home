import useSWR from "swr/esm/use-swr";
import find from "lodash/find";
import {useDeleter, useLoadingStatus, useUpdater} from "../swr-common";
import {useCallback, useMemo} from "react";
import {useImageUploader} from "./images";

const projectsApiUrl = "/projects";

export function useProjects(withUnpublished = false) {
    const result = useProjectsLoader(withUnpublished);
    return result.data;
}

export function useProject(id, withUnpublished = false) {
    const result = useProjectsLoader(withUnpublished);
    if (!result.data) return;
    return find(result.data, p => p.id === id) || result.data[0];
}

export function useProjectLoading(withUnpublished = false) {
    const result = useProjectsLoader(withUnpublished);
    return useLoadingStatus(result);
}

export function useProjectUpdater() {
    const updater = useUpdater(projectsApiUrl, false);
    const {updater: nestedUpdater} = updater;
    const {uploader: imageUploader} = useImageUploader(0);
    const updaterById = useCallback(async (id, body, logo) => {
        if (!id) {
            console.error(`ID not provided when updating project`);
            return;
        }
        if (logo) {
            const uploaded = await imageUploader(`project-${id}-logo`, logo);
            body.logoId = uploaded.id;
        }
        return nestedUpdater(body, `${projectsApiUrl}/${id}`);
    }, [imageUploader, nestedUpdater])
    return useMemo(() => ({...updater, updater: updaterById}), [updater, updaterById]);
}

export function useProjectDeleter() {
    const result = useDeleter(projectsApiUrl);
    const {deleter: nestedDeleter} = result;
    const deleter = useCallback(async id => {
        if (!id) {
            console.error(`Cannot delete project without ID`);
            return;
        }
        return nestedDeleter(`${projectsApiUrl}/${id}`);
    }, [nestedDeleter]);
    return useMemo(() => ({...result, deleter}), [deleter, result]);
}

function useProjectsLoader(withUnpublished) {
    return useSWR(`${projectsApiUrl}?published=${!withUnpublished}`);
}
