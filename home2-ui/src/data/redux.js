import {owner} from "./reduce/owner";
import {footer} from "./reduce/footer";
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
import {createMemoryHistory} from "history";
import {emptySaga} from "../utils/testing/test-saga";
import {Map} from "immutable";
import {reportError} from "../utils/error-reporting";

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

export function createTestStore(reducers, rootSaga) {
    if (!rootSaga) {
        rootSaga = emptySaga;
    }
    reducers = {ajax, ...reducers};
    let [mw, saga] = middleware(createMemoryHistory());
    let result = createStore(combineReducers(reducers), mw);
    let sagaTask = saga.run(rootSaga);
    return [result, sagaTask];
}

function middleware(history) {
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
        routerMiddleware(history),
        createLogger(reduxLoggerOpts())
    );
    return [result, saga];
}

function reduxLoggerOpts() {
    return {
        stateTransformer: state => Map(state).toJS(),
        actionTransformer: action => Map(action).toJS(),
    }
}
