import * as owner from "./reduce/owner";
import * as footer from "./reduce/footer";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import createReduxWaitForMiddleware from "redux-wait-for-action";
import {createLogger} from "redux-logger";
import promiseMiddleware from "redux-promise-middleware";
import * as images from "./reduce/images";
import * as projects from "./reduce/projects";
import * as articles from "./reduce/articles";
import * as tags from "./reduce/tags";
import * as latestArticles from "./reduce/latest-articles";
import * as authentication from "./reduce/authentication";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import * as ajax from "./reduce/ajax";
import {emptySaga} from "../utils/testing/test-saga";
import {reportError} from "../utils/error-reporting";
import * as search from "./reduce/search";
import {createWrapper} from "next-redux-wrapper";
import mapValues from "lodash/mapValues";
import keyBy from "lodash/keyBy";
import identity from "lodash/identity";

const modules = [
    ajax,
    articles,
    authentication,
    footer,
    images,
    latestArticles,
    owner,
    projects,
    search,
    tags,
]

const modulesBySegment = keyBy(modules, "segment");

export const reducers = mapValues(modulesBySegment, m => m.reducer);

export const reduxWrapper = createWrapper(createAppStore, {
    debug: false,
    serializeState: state => {
        const result = {...state};
        return mapValues(result, (v, k) => (modulesBySegment?.[k]?.serialiseJSON || identity)(v));
    },
    deserializeState: state => {
        return mapValues(state, (v, k) => (modulesBySegment?.[k]?.deserialiseJSON || identity)(v));
    }
});

export function createAppStore({isServer, req = null}) {
    let [mw, saga] = middleware();
    let result = createStore(
        combineReducers(reducers),
        mw
    );
    if (req || !isServer) {
        result.sagaTask = saga.run(rootSaga);
    }
    return result;
}

export function createTestStore(reducers, rootSaga) {
    if (!rootSaga) {
        rootSaga = emptySaga;
    }
    reducers = {ajax, ...reducers};
    let [mw, saga] = middleware();
    let result = createStore(combineReducers(reducers), mw);
    let sagaTask = saga.run(rootSaga);
    return [result, sagaTask];
}

function middleware() {
    let saga = createSagaMiddleware({
        onError(e, {sagaStack}) {
            console.error("Unhandled error in Saga:", sagaStack, e);
            reportError(e);
        }
    });

    let result = applyMiddleware(
        saga,
        thunk,
        promiseMiddleware,
        createReduxWaitForMiddleware(),
        createLogger(reduxLoggerOpts())
    );
    return [result, saga];
}

function reduxLoggerOpts() {
    return {};
}
