import * as owner from "./reduce/owner";
import * as footer from "./reduce/footer";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import createReduxWaitForMiddleware from "redux-wait-for-action";
import {createLogger} from "redux-logger";
import promiseMiddleware from "redux-promise-middleware";
import {images} from "./reduce/images";
import * as projects from "./reduce/projects";
import * as articles from "./reduce/articles";
import {tags} from "./reduce/tags";
import * as latestArticles from "./reduce/latest-articles";
import {authentication} from "./reduce/authentication";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import {ajax} from "./reduce/ajax";
import {emptySaga} from "../utils/testing/test-saga";
import {fromJS, Map} from "immutable";
import {reportError} from "../utils/error-reporting";
import {search} from "./reduce/search";
import {createWrapper} from "next-redux-wrapper";
import mapValues from "lodash/mapValues";
import keyBy from "lodash/keyBy";

const modules = [
    articles,
    owner,
    projects,
    latestArticles,
    footer,
]

const modulesBySegment = keyBy(modules, "segment");

export const reducers = {
    ajax,
    authentication,
    tags,
    images,
    search,
    ...(mapValues(modulesBySegment, m => m.reducer))
};

export const reduxWrapper = createWrapper(createAppStore, {
    debug: false,
    serializeState: state => {
        const result = {...state};
        delete result.ajax;
        return mapValues(result, (v, k) => (modulesBySegment?.[k]?.serialiseJSON || (n => n.toJS()))(v));
    },
    deserializeState: state => {
        return mapValues(state, (v, k) => (modulesBySegment?.[k]?.deserialiseJSON || fromJS)(v));
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
        // createLogger(reduxLoggerOpts())
    );
    return [result, saga];
}

function reduxLoggerOpts() {
    return {
        stateTransformer: state => Map(state).toJS(),
        actionTransformer: action => Map(action).toJS(),
    }
}
