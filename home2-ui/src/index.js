import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.css';
import {App} from './App';
import {createAppStore} from "./data/redux";
import {Provider as ReduxProvider} from "react-redux";
import {FileConverterProvider} from "./utils/file-converter-context";
import {createBrowserHistory} from "history";
import {ConnectedRouter} from "connected-react-router"
import {getErrorBoundary, setupErrorReporting} from "./utils/error-reporting";

setupErrorReporting();
const ErrorBoundary = getErrorBoundary();
const history = createBrowserHistory();
const store = createAppStore(history);

ReactDOM.render(
    <ErrorBoundary>
        <ReduxProvider store={store}>
            <ConnectedRouter history={history}>
                <FileConverterProvider>
                    <App/>
                </FileConverterProvider>
            </ConnectedRouter>
        </ReduxProvider>
    </ErrorBoundary>,
    document.getElementById('root'));

