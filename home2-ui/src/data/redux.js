import {owner} from "./reduce/owner";
import {footer} from "./reduce/footer";
import {reduxLoggerOpts} from "../utils/logger";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import promiseMiddleware from "redux-promise-middleware";
import {images} from "./reduce/images";
import {projects} from "./reduce/projects";
import {articles} from "./reduce/articles";
import {article} from "./reduce/article";
import {tags} from "./reduce/tags";
import {latestArticles} from "./reduce/latest-articles";
import {authentication} from "./reduce/authentication";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import {ajax} from "./reduce/ajax";

export const reducers = {
    ajax,
    authentication,
    owner,
    projects,
    articles,
    article,
    "latest-articles": latestArticles,
    tags,
    footer,
    images,
};

export function createAppStore() {
    let [mw, saga] = middleware();
    let result = createStore(
        combineReducers({
            ...reducers
        }),
        mw
    );
    saga.run(rootSaga);
    return result;
}

export function createTestStore(submodule, reducer) {
    let [mw, saga] = middleware();
    let result = createStore(combineReducers({[submodule]: reducer}), mw);
    saga.run(rootSaga);
    return result;
}

function middleware() {
    let saga = createSagaMiddleware();
    let result = applyMiddleware(
        saga,
        thunk,
        promiseMiddleware,
        createLogger(reduxLoggerOpts())
    );
    return [result, saga];
}