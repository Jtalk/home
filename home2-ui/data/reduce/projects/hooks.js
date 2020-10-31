import {
    useDeleting,
    useDirectDeleter,
    useDirectUpdater,
    useLastError,
    useLoader,
    useLoading,
    useUpdating
} from "../global/hook-barebone";
import ProjectRequests from "../../ajax/projects-requests";
import {action, error} from "../global/actions";
import {Action} from "./index";
import find from "lodash/find";
import {useRouter} from "next/router";
import {useCallback, useMemo} from "react";
import {useAllData, usePublishedData} from "../global/publishable-data";

export function useProjects(withUnpublished = false) {
    let published = usePublishedData("projects", "data");
    let all = useAllData("projects", "data");

    let loadAction = useMemo(() => action(Action.LOAD), []);
    useLoader(loadAction, !published && !withUnpublished);

    let reloadAction = useMemo(() => action(Action.RELOAD_UNPUBLISHED), []);
    useLoader(reloadAction, withUnpublished && !all);
    return (withUnpublished ? all : published) || [];
}

export function useProject(id, withUnpublished = false) {
    let projects = useProjects(withUnpublished) || [];
    if (id) {
        return find(projects, p => p.id === id);
    } else {
        return projects && projects[0];
    }
}

export function useProjectLoading() {
    return useLoading("projects");
}

export function useProjectUpdating() {
    return useUpdating("projects");
}

export function useProjectDeleting() {
    return useDeleting("projects");
}

export function useProjectError() {
    return useLastError("projects");
}

export function useProjectUpdater() {
    const router = useRouter();
    const updater = useDirectUpdater(update);
    return useCallback(async (id, redirectTo, update, {logo} = {}) => {
        await updater(update, {id, logo});
        if (redirectTo) {
            await router.push(redirectTo);
        }
    }, [router, updater]);
}

export function useProjectDeleter() {
    const router = useRouter();
    const deleter = useDirectDeleter(remove);
    return useCallback(async (id, redirectTo) => {
        await deleter(id);
        if (redirectTo) {
            await router.push(redirectTo);
        }
    }, [router, deleter]);
}

function update(update, {id, logo}) {
    return async (dispatch) => {
        try {
            let result = await ProjectRequests.update(id, update, logo);
            let reloaded = await ProjectRequests.load(false);
            dispatch(action(Action.UPDATED, {projects: reloaded, publishedOnly: false}));
            return result;
        } catch (e) {
            console.error(`Exception while updating project ${id}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
            return null;
        }
    };
}

function remove(projectId) {
    return async (dispatch) => {
        try {
            await ProjectRequests.remove(projectId);
            let reloaded = await ProjectRequests.load(false);
            dispatch(action(Action.DELETED, {projects: reloaded, publishedOnly: false}));
            return projectId;
        } catch (e) {
            console.error(`Exception while deleting project ${projectId}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString(), {error: e}));
            return null;
        }
    };
}
