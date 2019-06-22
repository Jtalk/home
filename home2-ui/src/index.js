import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {applyMiddleware, combineReducers, createStore} from "redux";
import {reducers} from "./data/redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {Logger, reduxLoggerOpts} from "./utils/logger";

const reduxLog = Logger.of("redux");
const store = createStore(
    combineReducers({
        ...reducers
    }),
    applyMiddleware(
        thunk,
        createLogger(reduxLoggerOpts(reduxLog))
    )
);

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
