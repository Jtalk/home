import {fromJS, Map} from "immutable";

import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";
import {Logger} from "../../utils/logger";

let log = Logger.of("data.reduce.owner");

let defaultOwner = fromJS({
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: [],
    bio: ""
});

let Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function owner(state = Map({loading: true, data: defaultOwner}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: true, data: defaultOwner});
        case Action.LOADED:
            return Map({loading: false, loaded: true, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: false, loaded: true, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: true, updated: false});
        case Action.UPDATED:
            return state.merge({updating: false, updated: true});
        case Action.UPDATE_ERROR:
            return state.merge({updating: false, updated: false, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

function action(action) {
    return {
        type: action
    }
}

function loaded(loadedOwner) {
    return {
        type: Action.LOADED,
        data: fromJS(loadedOwner)
    }
}

function error(action, errorMsg) {
    return {
        type: action,
        errorMessage: errorMsg
    }
}

export function load() {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let owner = await loadOwner();
            dispatch(loaded(owner));
        } catch (e) {
            log.error("Cannot load owner info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

async function loadOwner() {
    let response = await request.get("/owner")
        .use(api);
    await apiDelay();
    return response.body
}