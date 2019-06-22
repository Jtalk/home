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
            return state.merge({updating: false, updated: true, data: action.data});
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

function newState(action, newOwner) {
    return {
        type: action,
        data: newOwner
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
            dispatch(newState(Action.LOADED, fromJS(owner)));
        } catch (e) {
            log.error("Cannot load owner info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            let newOwner = await updateOwner(update, photo);
            dispatch(newState(Action.UPDATED, newOwner));
        } catch (e) {
            log.error(`Exception while updating owner bio for ${JSON.stringify(update)}`, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

async function loadOwner() {
    let response = await request.get("/owner")
        .use(api);
    await apiDelay();
    return response.body
}

async function updateOwner(update, photo) {
    let photoId = await updatePhoto(photo);
    if (photoId) {
        update = update.set("photoId", photoId);
    }
    let response = await request.post("/owner", update)
        .use(api);
    log.info(`Owner updated with ${response.status}: ${response.text}`);
    return update;
}

async function updatePhoto(photo) {
    if (!photo) {
        return null;
    }
    try {
        let response = await request.post("/images")
            .attach("img", photo)
            .use(api);

        let body = response.body;
        if (body.status !== "ok") {
            log.error(`Unexpected response from API upon photo upload: ${JSON.stringify(body)}`);
            throw Error("API error while uploading photo");
        }
        return body.id;
    } catch (e) {
        log.error("Exception while uploading a new photo", e);
        throw Error("Cannot upload a new photo")
    }
}
