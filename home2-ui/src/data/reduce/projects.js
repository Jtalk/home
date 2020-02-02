import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import _ from "lodash";

export const Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function projects(state = Map({loading: Loading.LOADING, data: []}), action) {
    console.debug("New action", action);
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: []});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: updateState(state, action.data)});
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let project = await ajax.projects.load();
            dispatch(newState(Action.LOADED, fromJS(project)));
        } catch (e) {
            console.error("Cannot load project info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

function updateState(currentState, update) {
    console.debug("Data is", currentState, update);
    _.forOwn(update, (value, key) => {
        currentState = currentState.updateIn(["data"], list => {
            let found = _.findIndex(list, v => v.id === key);
            if (found === -1) {
                return list.push(update);
            } else {
                return list.fill(found, 1, update);
            }
        });
    });
    console.debug("New current state", currentState);
    return currentState;
}

export function update(ajax, projectId, update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let newProject = await ajax.projects.update(projectId, update, photo);
            dispatch(newState(Action.UPDATED, {[projectId]: fromJS(newProject)}));
        } catch (e) {
            console.error(`Exception while updating project ${projectId}`, update, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

