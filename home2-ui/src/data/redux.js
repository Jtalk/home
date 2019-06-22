import {owner} from "./reduce/owner";
import {Logger, reduxLoggerOpts} from "../utils/logger";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";

export const reducers = {
    owner
};

const reduxLog = Logger.of("redux");
export function createAppStore() {
    return createStore(
        combineReducers({
            ...reducers
        }),
        applyMiddleware(
            thunk,
            createLogger(reduxLoggerOpts(reduxLog))
        )
    );
}
