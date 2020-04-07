import {fromJS, Map} from "immutable";
import {Deleting, Loading, Updating} from "./global/enums";
import {action, error, takeOnce} from "./global/actions";
import _ from "lodash";
import {
    useDeleter2,
    useDeleting,
    useLastError,
    useLoader,
    useLoading,
    useUpdater2,
    useUpdating
} from "./global/hook-barebone";
import {useImmutableSelector} from "../../utils/redux-store";
import {fetchAjax} from "./ajax";
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";

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

export function projects(state = Map({loading: Loading.LOADING, data: Map()}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined});
        case Action.LOADED:
            return state.merge({
                loading: Loading.READY, errorMessage: undefined,
                data: asStoreData(action.data.projects, !action.data.publishedOnly)
            });
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({
                updating: Updating.UPDATED, errorMessage: undefined,
                data: asStoreData(action.data.projects, !action.data.publishedOnly)
            });
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        case Action.DELETE:
            return state.merge({deleting: Deleting.DELETING, errorMessage: undefined});
        case Action.DELETED:
            return state.merge({deleting: Deleting.DELETED, data: fromJS(action.data)});
        case Action.DELETE_ERROR:
            return state.merge({deleting: Deleting.DELETE_ERROR, errorMessage: action.data});
        default:
            return state;
    }
}

export function* watchProjects() {
    yield takeOnce(Action.LOAD, () => load(true));
    yield takeLatest(Action.RELOAD_UNPUBLISHED, () => load(false));
    yield takeEvery(Action.UPDATE, ({data}) => update(data.extra.id, data.update, data.extra.logo));
    yield takeEvery(Action.DELETE, ({data}) => remove(data));
}

export function useProjects(withUnpublished = false) {
    let published = useImmutableSelector("projects", "data", "published");
    let all = useImmutableSelector("projects", "data", "all");
    useLoader(action(Action.LOAD), !published);
    useLoader(action(Action.RELOAD_UNPUBLISHED), withUnpublished && !all);
    return (withUnpublished ? all : published) || [];
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
    let updater = useUpdater2(Action.UPDATE);
    return (id, update, {logo}) => updater(update, {id, logo});
}

export function useProjectDeleter() {
    return useDeleter2(Action.DELETE);
}

function* load(publishedOnly) {
    let ajax = yield fetchAjax();
    try {
        let projects = yield call(ajax.projects.load, publishedOnly);
        projects = _.sortBy(projects, "order");
        yield put(action(Action.LOADED, {projects, publishedOnly}));
    } catch (e) {
        console.error("Cannot load project info", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* update(projectId, update, logo) {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.projects.update, projectId, update, logo);
        let projects = yield call(ajax.projects.load, false);
        yield put(action(Action.UPDATED, {projects}));
    } catch (e) {
        console.error(`Exception while updating project ${projectId}`, update, e);
        yield put(error(Action.UPDATE_ERROR, e.toLocaleString()));
    }
}

function* remove(projectId) {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.projects.remove, projectId);
        let projects = yield call(ajax.projects.load, false);
        yield put(action(Action.DELETED, {projects}));
    } catch (e) {
        console.error(`Exception while deleting project ${projectId}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString()));
    }
}

function asStoreData(projects, withUnpublished) {
    if (withUnpublished) {
        let published = projects.filter(p => p.published);
        return fromJS({
            all: projects,
            published
        });
    } else {
        return fromJS({
            published: projects
        });
    }
}