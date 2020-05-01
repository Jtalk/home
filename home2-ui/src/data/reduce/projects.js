import {Map} from "immutable";
import {Deleting, Loading, Updating} from "./global/enums";
import {action, error} from "./global/actions";
import {push} from "connected-react-router";
import {
    useDeleting,
    useDirectDeleter,
    useDirectUpdater,
    useLastError,
    useLoader,
    useLoading,
    useUpdating
} from "./global/hook-barebone";
import {ajaxSelector, fetchAjax} from "./ajax";
import {call, put, takeLatest} from "redux-saga/effects";
import {publishableData, useAllData, usePublishedData} from "./global/publishable-data";
import {useMemo} from "react";
import {find} from "lodash-es";

export const Action = {
    LOAD: Symbol("projects load"),
    LOADED: Symbol("projects loaded"),
    LOAD_ERROR: Symbol("projects load error"),
    RELOAD_UNPUBLISHED: Symbol("projects reload with unpublished"),
    UPDATE: Symbol("projects update"),
    UPDATED: Symbol("projects updated"),
    UPDATE_ERROR: Symbol("projects update error"),
    DELETE: Symbol("projects delete"),
    DELETED: Symbol("projects deleted"),
    DELETE_ERROR: Symbol("projects delete error"),
};

export function projects(state = Map({loading: Loading.LOADING, data: Map(), version: 1}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined});
        case Action.LOADED:
            return state.merge({
                loading: Loading.READY, errorMessage: undefined,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({
                updating: Updating.UPDATED, errorMessage: undefined,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return state.merge({deleting: Deleting.DELETING, errorMessage: undefined});
        case Action.DELETED:
            return state.merge({
                deleting: Deleting.DELETED, errorMessage: undefined,
                data: publishableData(action.data.projects, !action.data.publishedOnly),
            });
        case Action.DELETE_ERROR:
            return state.merge({deleting: Deleting.DELETE_ERROR, errorMessage: action.data});
        default:
            return state;
    }
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
    let updater = useDirectUpdater(update);
    return async (id, redirectTo, update, {logo} = {}) => await updater(update, {id, logo, redirectTo});
}

export function useProjectDeleter() {
    let deleter = useDirectDeleter(remove);
    return async (id, redirectTo) => deleter(id, {redirectTo});
}

function* load(publishedOnly) {
    let ajax = yield fetchAjax();
    try {
        let projects = yield call(ajax.projects.load, publishedOnly);
        yield put(action(Action.LOADED, {projects, publishedOnly}));
    } catch (e) {
        console.error("Cannot load project info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function update(update, {id, logo, redirectTo}) {
    return async (dispatch, getState) => {
        let ajax = ajaxSelector(getState());
        try {
            let result = await ajax.projects.update(id, update, logo);
            let reloaded = await ajax.projects.load(false);
            dispatch(action(Action.UPDATED, {projects: reloaded, publishedOnly: false}));
            if (redirectTo) {
                dispatch(push(redirectTo));
            }
            return result;
        } catch (e) {
            console.error(`Exception while updating project ${id}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString(), {error: e}));
            return null;
        }
    };
}

function remove(projectId, {redirectTo}) {
    return async (dispatch, getState) => {
        let ajax = ajaxSelector(getState());
        try {
            await ajax.projects.remove(projectId);
            let reloaded = await ajax.projects.load(false);
            dispatch(action(Action.DELETED, {projects: reloaded, publishedOnly: false}));
            if (redirectTo) {
                dispatch(push(redirectTo));
            }
            return projectId;
        } catch (e) {
            console.error(`Exception while deleting project ${projectId}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString(), {error: e}));
            return null;
        }
    };
}
