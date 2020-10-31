import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import createReduxWaitForMiddleware from "redux-wait-for-action";
import promiseMiddleware from "redux-promise-middleware";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./saga";
import {reportError} from "../utils/error-reporting";
import {createWrapper} from "next-redux-wrapper";
import {deserialiseJSON, serialiseJSON} from "./reduce/global/json-io";

export const reduxWrapper = createWrapper(createAppStore, {
    debug: false,
    serializeState: serialiseJSON,
    deserializeState: deserialiseJSON,
});

export function createAppStore({isServer, req = null}) {
    let [mw, saga] = middleware();
    let result = createStore(
        combineReducers([]),
        mw
    );
    if (req || !isServer) {
        result.sagaTask = saga.run(rootSaga);
    }
    return result;
}

export function middleware() {
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
