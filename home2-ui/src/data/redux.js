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
import {tags} from "./reduce/tags";
import {latestArticles} from "./reduce/latest-articles";
import {authentication} from "./reduce/authentication";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import {ajax} from "./reduce/ajax";
import {routerMiddleware, connectRouter} from "connected-react-router"

export const reducers = {
    ajax,
    authentication,
    owner,
    projects,
    articles,
    "latest-articles": latestArticles,
    tags,
    footer,
    images,
};

export function createAppStore(history) {
    let [mw, saga] = middleware(history);
    let result = createStore(
        combineReducers({
            router: connectRouter(history),
            ...reducers
        }),
        mw
    );
    saga.run(rootSaga);
    return result;
}

export function createTestStore(reducers) {
    reducers = Object.assign({}, {ajax}, reducers);
    let [mw, saga] = middleware();
    let result = createStore(combineReducers(reducers), mw);
    saga.run(rootSaga);
    return result;
}

function middleware(history) {
    let saga = createSagaMiddleware();

    let result = applyMiddleware(
        saga,
        thunk,
        promiseMiddleware,
        routerMiddleware(history),
        createLogger(reduxLoggerOpts())
    );
    return [result, saga];
}