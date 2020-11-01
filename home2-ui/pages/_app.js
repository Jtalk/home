import React from 'react';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import "highlight.js/styles/idea.css";
import {setupErrorReporting} from "../utils/error-reporting";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {useLoggedIn} from "../data/hooks/authentication";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";
import withAuthentication from "../data/hooks/authentication/with-authentication";

const {ErrorBoundary} = setupErrorReporting();

function App({Component, pageProps}) {

    const isLoggedIn = useLoggedIn();
    const router = useRouter();
    const disableSSR = !process.browser && router.pathname.startsWith("/admin");
    if (disableSSR) {
        Component = dynamic(() => Promise.resolve(Component), {ssr: false})
    }
    if (process.browser && router.pathname.startsWith("/admin") && !isLoggedIn) {
        Component = dynamic(() => import("../component/error/not-found"));
    }

    const Header = dynamic(() => import("../component/header/header"));
    const Footer = dynamic(() => import("../component/footer/footer"));

    return <ErrorBoundary>
        <div className="main-content-pushable">
            <Container className="main-content-pusher framed">
                <Header/>
                <Component {...pageProps}/>
            </Container>
            <ErrorBoundary FallbackComponent={<div/>}>
                <Footer/>
            </ErrorBoundary>
        </div>
    </ErrorBoundary>
}

export default withAuthentication(App);
