import {owner} from "./reduce/owner";
import {footer} from "./reduce/footer";
import {reduxLoggerOpts} from "../utils/logger";
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

export function createAppStore() {
    return createStore(
        combineReducers({
            ...reducers
        }),
        middleware()
    );
}

export function createTestStore(submodule, reducer) {
    return createStore(combineReducers({[submodule]: reducer}), middleware());
}

function middleware() {
    return applyMiddleware(
        thunk,
        promiseMiddleware,
        createLogger(reduxLoggerOpts())
    );
}