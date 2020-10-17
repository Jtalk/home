import React from 'react';
import {Container} from "semantic-ui-react";
import {Footer} from "../src/component/footer/footer";
import {Navigation} from "../src/navigation/navigation"
import {RenderMode} from "../src/navigation/render-context";
import {OwnerTitled} from "../src/page/about/owner-titled";
import {setupErrorReporting} from "../src/utils/error-reporting";

const {ErrorBoundary} = setupErrorReporting();

export default function App() {
    return <div className="main-content-pushable">
        <Container className="main-content-pusher framed">
            <OwnerTitled>
                <Navigation renderMode={RenderMode.MENU}/>
                <Navigation renderMode={RenderMode.ROUTER}/>
            </OwnerTitled>
        </Container>
        <ErrorBoundary FallbackComponent={<div/>}>
            <Footer/>
        </ErrorBoundary>
    </div>
};
