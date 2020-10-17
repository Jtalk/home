import React from 'react';
import './index.css';
import 'semantic-ui-css/semantic.css';
import "highlight.js/styles/idea.css";
import {createAppStore} from "../data/redux";
import {Provider as ReduxProvider} from "react-redux";
import {FileConverterProvider} from "../utils/file-converter-context";
import {createBrowserHistory, createMemoryHistory} from "history";
import {ConnectedRouter} from "connected-react-router"
import {setupErrorReporting} from "../utils/error-reporting";
import {Container} from "semantic-ui-react";
import {OwnerTitled} from "../component/about/owner-titled";
import {Footer} from "../component/footer/footer";
import {Header} from "../component/header/header";

const {ErrorBoundary} = setupErrorReporting();
const history = process.browser ? createBrowserHistory() : createMemoryHistory();
const store = createAppStore(history);

export default function _App({Component, pageProps}) {
    return <ErrorBoundary>
        <ReduxProvider store={store}>
            <ConnectedRouter history={history}>
                <FileConverterProvider>
                    <div className="main-content-pushable">
                        <Container className="main-content-pusher framed">
                            <OwnerTitled>
                                <Header/>
                                <Component {...pageProps}/>
                            </OwnerTitled>
                        </Container>
                        <ErrorBoundary FallbackComponent={<div/>}>
                            <Footer/>
                        </ErrorBoundary>
                    </div>
                </FileConverterProvider>
            </ConnectedRouter>
        </ReduxProvider>
    </ErrorBoundary>
}

