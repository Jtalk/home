import {fromJS, Map} from "immutable";
import {Deleting, Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import _ from "lodash";

export const Action = {
    LOAD: Symbol("projects load"),
    LOADED: Symbol("projects loaded"),
    LOAD_ERROR: Symbol("projects load error"),
    UPDATE: Symbol("projects update"),
    UPDATED: Symbol("projects updated"),
    UPDATE_ERROR: Symbol("projects update error"),
    DELETE: Symbol("projects delete"),
    DELETED: Symbol("projects deleted"),
    DELETE_ERROR: Symbol("projects delete error"),
};

export function projects(state = Map({loading: Loading.LOADING, data: []}), action) {
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

export function load(ajax, publishedOnly=false) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let projects = await ajax.projects.load(publishedOnly);
            projects = _.sortBy(projects, "order");
            dispatch(newState(Action.LOADED, projects));
        } catch (e) {
            console.error("Cannot load project info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function loadPublished(ajax) {
    return load(ajax, true);
}

function updateState(currentState, update) {
    console.debug("Data is", currentState.toJS(), update);
    _.forOwn(update, (value, key) => {
        let found = currentState.findIndex(v => v.get("id") === key);
        let immutableValue = fromJS(value);
        if (found === -1) {
            currentState = currentState.push(immutableValue);
        } else {
            let needSort = currentState.get(found).get("order") !== value.order;
            currentState = currentState.splice(found, 1, immutableValue);
            if (needSort) {
                currentState = currentState.sortBy(v => v.get("order"));
            }
        }
    });
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