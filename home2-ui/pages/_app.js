import React from 'react';
import './index.css';
import 'semantic-ui-css/semantic.css';
import "highlight.js/styles/idea.css";
import {createAppStore} from "../data/redux";
import {FileConverterProvider} from "../utils/file-converter-context";
import {setupErrorReporting} from "../utils/error-reporting";
import {Container} from "semantic-ui-react";
import {OwnerTitled} from "../component/about/owner-titled";
import {Footer} from "../component/footer/footer";
import {Header} from "../component/header/header";
import {createWrapper} from "next-redux-wrapper";
import withReduxSaga from "next-redux-saga";

const {ErrorBoundary} = setupErrorReporting();

function App({Component, pageProps}) {
    return <ErrorBoundary>
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
    </ErrorBoundary>
}

const wrapper = createWrapper(createAppStore, {debug: true});
export default wrapper.withRedux(withReduxSaga(App));
