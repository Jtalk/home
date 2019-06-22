import * as config from "react-global-configuration";
import {applyMiddleware, combineReducers, createStore} from "redux";
import {reducers} from "../redux";
import thunk from "redux-thunk";
import * as request from "superagent";
import * as owner from "./owner";

const defaultOwner = {
    name: "",
    photoId: "",
    nickname: "",
    description: "",
    contacts: [],
    bio: ""
};

const mockOwner = {
    name: "Vasya Pupkin",
    photoId: "",
    nickname: "pupkovas",
    description: "A bloke",
    contacts: [{contactType: "EMAIL", value: ""}],
    bio: "Some lengthy bio"
};

describe('Redux(owner)', () => {
    let store;
    let sm;
    beforeEach(() => {
        store = createStore(
            combineReducers({
                ...reducers
            }),
            applyMiddleware(
                thunk,
            )
        );
        config.set({
            api: '',
        });
        sm = require('superagent-mocker')(request);
        sm.clearRoutes();
        sm.get('/owner', () => {
            return {body: mockOwner};
        });
    });
    test('default owner is provided before load', () => {
        let ownerState = {a: 1};
        store.subscribe(() => ownerState = store.getState().owner.toJS());
        owner.load()(store.dispatch.bind(store));
        expect(ownerState.data).toEqual(defaultOwner);
        expect(ownerState.loading).toBeTruthy();
    })
});