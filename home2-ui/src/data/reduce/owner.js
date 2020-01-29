import {fromJS, Map} from "immutable";
import {Loading, Updating} from "./global/enums";
import {action, error, newState} from "./global/actions";
import _ from "lodash";

let defaultOwner = fromJS({
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: {},
    bio: ""
});

export const Action = {
    LOAD: Symbol("load"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPDATE: Symbol("update"),
    UPDATED: Symbol("updated"),
    UPDATE_ERROR: Symbol("update error"),
};

export function owner(state = Map({loading: Loading.LOADING, data: defaultOwner}), action) {
    switch (action.type) {
        case Action.LOAD:
            return Map({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: defaultOwner});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: action.data});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        case Action.UPDATE:
            return state.merge({updating: Updating.UPDATING, errorMessage: undefined});
        case Action.UPDATED:
            return state.merge({updating: Updating.UPDATED, errorMessage: undefined, data: action.data});
        case Action.UPDATE_ERROR:
            return state.merge({updating: Updating.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

function fromApiDomain(apiDomainObject) {
    function toContactsDictionary(contactsArray) {
        return _.chain(contactsArray)
            .groupBy(c => c.contactType)
            .mapValues((cs, key) => {
                if (cs.length > 1) {
                    throw Error(`Duplicate contact type ${key}: ${cs}`);
                }
                return _.omit(cs[0], "contactType");
            })
            .mapKeys((_, k) => k.toLowerCase())
            .value();
    }
    return Object.assign({}, apiDomainObject, {contacts: toContactsDictionary(apiDomainObject.contacts)});
}

function toApiDomain(uiObject) {
    function toContactsArray(contactsDictionary) {
        return _.chain(contactsDictionary)
            .mapKeys((_, k) => k.toUpperCase())
            .toPairs()
            .map(([contactType, value]) => Object.assign({}, value, {contactType}))
            .value();
    }
    return Object.assign({}, uiObject, {contacts: toContactsArray(uiObject.contacts)});
}

export function load(ajax) {
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let owner = await ajax.owner.load();
            owner = fromApiDomain(owner);
            dispatch(newState(Action.LOADED, fromJS(owner)));
        } catch (e) {
            console.error("Cannot load owner info", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function update(ajax, update, photo) {
    return async dispatch => {
        dispatch(action(Action.UPDATE));
        try {
            update = toApiDomain(update);
            let newOwner = await ajax.owner.update(update, photo);
            newOwner = fromApiDomain(newOwner);
            dispatch(newState(Action.UPDATED, fromJS(newOwner)));
        } catch (e) {
            console.error(`Exception while updating owner bio for ${JSON.stringify(update)}`, e);
            dispatch(error(Action.UPDATE_ERROR, e.toLocaleString()));
        }
    };
}

