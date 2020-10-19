import {Deleting, Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {
    useDeleting,
    useDirectDeleter,
    useDirectUpdater,
    useLastError,
    useLoader,
    useLoading,
    useUpdating
} from "./global/hook-barebone";
import {call, put, takeLatest} from "redux-saga/effects";
import {publishableData, useAllData, usePublishedData} from "./global/publishable-data";
import {useCallback, useMemo} from "react";
import {useRouter} from "next/router";
import {HYDRATE} from "next-redux-wrapper";
import {hydrate} from "../redux-store";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import find from "lodash/find";
import merge from "lodash/merge";
import ProjectRequests from "../ajax/projects-requests";

export const Action = {
    LOAD: "projects load",
    LOADED: "projects loaded",
    LOAD_ERROR: "projects load error",
    RELOAD_UNPUBLISHED: "projects reload with unpublished",
    UPDATE: "projects update",
    UPDATED: "projects updated",
    UPDATE_ERROR: "projects update error",
    DELETE: "projects delete",
    DELETED: "projects deleted",
    DELETE_ERROR: "projects delete error",
};

export const segment = "projects";

export function reducer(state = {loading: null, data: {}, version: 1}, action) {
    switch (action.type) {
        case Action.LOAD:
            return {loading: Loading.LOADING, errorMessage: null, uploading: null};
        case Action.LOADED:
            return merge({}, state, {
                loading: Loading.READY, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return merge({}, state, {updating: Updating.UPDATING, errorMessage: null});
        case Action.UPDATED:
            return merge({}, state, {
                updating: Updating.UPDATED, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.UPDATE_ERROR:
            return merge({}, state, {updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return merge({}, state, {deleting: Deleting.DELETING, errorMessage: null});
        case Action.DELETED:
            return merge({}, state, {
                deleting: Deleting.DELETED, errorMessage: null,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.DELETE_ERROR:
            return merge({}, state, {deleting: Deleting.DELETE_ERROR, errorMessage: action.data});
        case HYDRATE:
            return hydrate(state, action, segment);
        default:
            return state;
    }
}

export const projectActions = {
    load: () => ({ type: Action.LOAD, [WAIT_FOR_ACTION]: Action.LOADED, [ERROR_ACTION]: Action.LOAD_ERROR })
}

export function* watchProjects() {
    yield takeLatest(Action.LOAD, () => load(true));
    yield takeLatest(Action.RELOAD_UNPUBLISHED, () => load(false));
}

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

function* load(publishedOnly) {
    try {
        let projects = yield call(ProjectRequests.load, publishedOnly);
        yield put(action(Action.LOADED, {projects, publishedOnly}));
    } catch (e) {
        console.error("Cannot load project info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
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
