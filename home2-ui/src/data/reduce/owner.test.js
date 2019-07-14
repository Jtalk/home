import * as config from "react-global-configuration";
import {applyMiddleware, combineReducers, createStore} from "redux";
import {reducers} from "../redux";
import thunk from "redux-thunk";
import * as owner from "./owner";
import smmock from "superagent-mocker";

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
        sm = smmock(owner.superagentRequest);
        sm.clearRoutes();
        sm.get("/owner", () => {
            return {body: mockOwner};
        });
    });
    test('default owner is provided before load', async () => {
        let ownerStates = [];
        store.subscribe(() => ownerStates.push(store.getState().owner.toJS()));
        await owner.load()(store.dispatch.bind(store));
        expect(ownerStates.length).toBeGreaterThan(0);
        expect(ownerStates[0].data).toEqual(defaultOwner);
        expect(ownerStates[0].loading).toBeTruthy();
    })
});