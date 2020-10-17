import React from 'react';
import './index.css';
import 'semantic-ui-css/semantic.css';
import "highlight.js/styles/idea.css";
import {createAppStore} from "../src/data/redux";
import {Provider as ReduxProvider} from "react-redux";
import {FileConverterProvider} from "../src/utils/file-converter-context";
import {createBrowserHistory, createMemoryHistory} from "history";
import {ConnectedRouter} from "connected-react-router"
import {setupErrorReporting} from "../src/utils/error-reporting";

const {ErrorBoundary} = setupErrorReporting();
const history = process.browser ? createBrowserHistory() : createMemoryHistory();
const store = createAppStore(history);

export default function _App({Component, pageProps}) {
    return <ErrorBoundary>
        <ReduxProvider store={store}>
            <ConnectedRouter history={history}>
                <FileConverterProvider>
                    <Component {...pageProps}/>
                </FileConverterProvider>
            </ConnectedRouter>
        </ReduxProvider>
    </ErrorBoundary>
}

