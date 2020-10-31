import {combineReducers, createStore, middleware} from "redux";
import {emptySaga} from "../utils/testing/test-saga";

export function createTestStore(reducers, rootSaga) {
    if (!rootSaga) {
        rootSaga = emptySaga;
    }
    let [mw, saga] = middleware();
    let result = createStore(combineReducers(reducers), mw);
    let sagaTask = saga.run(rootSaga);
    return [result, sagaTask];
}
