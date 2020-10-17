import {createTestStore} from "../redux";
import * as owner from "./owner";
import {watchOwner} from "./owner";
import {Loading} from "./global/enums";
import {END, runSaga} from "redux-saga";
import {immutableSelector} from "../redux-store";

const mockOwner = {
    name: "Vasya Pupkin",
    photoId: "",
    nickname: "pupkovas",
    description: "A bloke",
    contacts: {email: {contactType: "email", value: ""}},
    bio: "Some lengthy bio"
};

describe('Redux(owner)', () => {
    let store;
    let ajax;
    beforeEach(() => {
        ajax = {
            owner: {
                load: jest.fn(async () => mockOwner),
            }
        };
        [store] = createTestStore({
            owner: owner.owner,
            ajax: () => ajax
        });
    });
    test('default owner is provided before load', async () => {
        let state = immutableSelector("owner")(store.getState());
        expect(state.loading).toBe(Loading.LOADING);
        expect(state.data).toMatchObject({
            name: "",
            contacts: {},
        })
    });
    test('the loaded owner is provided after load', async () => {
        runSaga({
            getState: store.getState,
            dispatch: store.dispatch,
        }, watchOwner);
        await store.dispatch(END);
        let state = immutableSelector("owner")(store.getState());
        expect(state.loading).toBe(Loading.READY);
        expect(state.data).toMatchObject(mockOwner);
    });
});