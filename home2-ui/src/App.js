import React from 'react';
import './App.css';
import {Container} from "semantic-ui-react";
import {Footer} from "./footer/footer";
import "./utils/config";
import {Titled} from "react-titled";
import * as owner from "./data/reduce/owner";
import {useAjaxLoader} from "./context/ajax-context";
import {useImmutableSelector} from "./utils/redux-store";
import {useAuthenticationInit} from "./data/reduce/authentication";
import {Navigation} from "./navigation/navigation"
import {BrowserRouter as Router} from "react-router-dom";
import {RenderMode} from "./navigation/render-context";

export const App = function () {
    useAuthenticationInit();
    useAjaxLoader(owner.load);
    let ownerName = useImmutableSelector("owner", ["data", "name"]);
    return <div className="main-content-pushable">
        <Container className="main-content-pusher framed">
            <Titled title={() => ownerName}>
                <Router>
                    <Navigation renderMode={RenderMode.ROUTER}/>
                </Router>
            </Titled>
        </Container>
        <Footer/>
    </div>
};
