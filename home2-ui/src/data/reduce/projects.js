import {fromJS, Map} from "immutable";
import {Deleting, Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import _ from "lodash";

export const Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
    DELETE: Symbol("delete"),
    DELETED: Symbol("deleted"),
    DELETE_ERROR: Symbol("delete error"),
};

export function projects(state = Map({loading: Loading.LOADING, data: []}), action) {
    console.debug("New action", action);
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: []});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: updateState(state.get("data"), action.data)});
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

export function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let projects = await ajax.projects.load();
            dispatch(newState(Action.LOADED, projects));
        } catch (e) {
            console.error("Cannot load project info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

function updateState(currentState, update) {
    console.debug("Data is", currentState.toJS(), update);
    _.forOwn(update, (value, key) => {
        let found = currentState.findIndex(v => v.get("id") === key);
        if (found === -1) {
            currentState = currentState.push(value);
        } else {
            currentState = currentState.splice(found, 1, value);
        }
    });
    console.debug("New current state", currentState);
    return currentState;
}

export function update(ajax, projectId, update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let newProject = await ajax.projects.update(projectId, update, photo);
            dispatch(newState(Action.UPDATED, {[projectId]: newProject}));
        } catch (e) {
            console.error(`Exception while updating project ${projectId}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

export function remove(ajax, projectId) {
    return async dispatch => {
        dispatch(action(Action.DELETE));
        try {
            await ajax.projects.remove(projectId);
            let updatedList = await ajax.projects.load();
            dispatch(newState(Action.DELETED, updatedList));
        } catch (e) {
            console.error(`Exception while deleting project ${projectId}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString()));
        }
    };
}