import React from 'react';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import "highlight.js/styles/idea.css";
import {reduxWrapper} from "../data/redux";
import {FileConverterProvider} from "../utils/file-converter-context";
import {setupErrorReporting} from "../utils/error-reporting";
import {Footer} from "../component/footer/footer";
import {Header} from "../component/header/header";
import withReduxSaga from "next-redux-saga";
import {useRouter} from "next/router";
import {NotFound} from "../component/error/not-found";
import dynamic from "next/dynamic";
import {useLoggedIn} from "../data/reduce/authentication/hooks";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";

const {ErrorBoundary} = setupErrorReporting();

function App({Component, pageProps}) {
    const isLoggedIn = useLoggedIn();
    const router = useRouter();
    const disableSSR = !process.browser && router.pathname.startsWith("/admin");
    if (disableSSR) {
        Component = dynamic(() => Promise.resolve(Component), {ssr: false})
    }
    if (process.browser && router.pathname.startsWith("/admin") && !isLoggedIn) {
        Component = NotFound;
    }
    return <ErrorBoundary>
        <FileConverterProvider>
            <div className="main-content-pushable">
                <Container className="main-content-pusher framed">
                    <Header/>
                    <Component {...pageProps}/>
                </Container>
                <ErrorBoundary FallbackComponent={<div/>}>
                    <Footer/>
                </ErrorBoundary>
            </div>
        </FileConverterProvider>
    </ErrorBoundary>
}

export default reduxWrapper.withRedux(withReduxSaga(App));
