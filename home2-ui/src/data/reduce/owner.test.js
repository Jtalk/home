import {createTestStore} from "../redux";
import * as owner from "./owner";
import {Loading} from "./global/enums";

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
    let ajax;
    beforeEach(() => {
        store = createTestStore("owner", owner.owner);
        ajax = {
            owner: {
                load: jest.fn(async () => mockOwner),
            }
        };
    });
    test('default owner is provided before load', async () => {
        let ownerStates = [];
        store.subscribe(() => ownerStates.push(store.getState().owner.toJS()));
        await owner.load(ajax)(store.dispatch.bind(store));
        expect(ownerStates.length).toBeGreaterThan(0);
        expect(ownerStates[0]).toMatchObject({
            data: {
                name: "",
                contacts: [],
            },
            loading: Loading.LOADING
        })
    });
    test('the loaded owner is provided after load', async () => {
        let currentState;
        store.subscribe(() => currentState = store.getState().owner.toJS());
        await owner.load(ajax)(store.dispatch.bind(store));
        expect(currentState).toMatchObject({
            data: mockOwner,
            loading: Loading.READY,
        })
    });
});