import * as owner from "./reduce/owner";
import * as footer from "./reduce/footer/reducer";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import createReduxWaitForMiddleware from "redux-wait-for-action";
import promiseMiddleware from "redux-promise-middleware";
import * as images from "./reduce/images";
import * as projects from "./reduce/projects";
import * as articles from "./reduce/articles";
import * as tags from "./reduce/tags";
import * as latestArticles from "./reduce/latest-articles/reducer";
import * as authentication from "./reduce/authentication/reducer";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import {emptySaga} from "../utils/testing/test-saga";
import {reportError} from "../utils/error-reporting";
import * as search from "./reduce/search";
import {createWrapper} from "next-redux-wrapper";
import mapValues from "lodash/mapValues";
import keyBy from "lodash/keyBy";
import identity from "lodash/identity";

const modules = [
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
        reduxLoggerLoader
    );
    return [result, saga];
}

function reduxLoggerOpts() {
    return {};
}

function reduxLoggerLoader(api) {
    let logger = null;
    let loggerLoading = false;
    return next => {
        return action => {
            if (!logger) {
                if (!loggerLoading) {
                    loggerLoading = true;
                    import("redux-logger")
                        .then(logger => logger.createLogger)
                        .then(cl => { logger = cl(reduxLoggerOpts())(api); })
                        .catch(err => console.error("Error loading Redux logger", err));
                }
                return next(action);
            }
            return logger(next)(action);
        }
    }
}
