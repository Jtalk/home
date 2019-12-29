import {owner} from "./reduce/owner";
import {footer} from "./reduce/footer";
import {Logger, reduxLoggerOpts} from "../utils/logger";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import promiseMiddleware from "redux-promise-middleware";
import {images} from "./reduce/images";

export const reducers = {
    owner,
    footer,
    images,
};

const reduxLog = Logger.of("redux");
export function createAppStore() {
    return createStore(
        combineReducers({
            ...reducers
        }),
        middleware()
    );
}

export function createTestStore(submodule, reducer) {
    return createStore((oldState, action) => { return {[`${submodule}`]: reducer(oldState, action) }}, middleware());
}

function middleware() {
    return applyMiddleware(
        thunk,
        promiseMiddleware,
        createLogger(reduxLoggerOpts(reduxLog))
    );
}