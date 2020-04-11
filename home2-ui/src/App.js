import React from 'react';
import './App.css';
import {Container} from "semantic-ui-react";
import {Footer} from "./footer/footer";
import "./utils/config";
import {Navigation} from "./navigation/navigation"
import {RenderMode} from "./navigation/render-context";
import {OwnerTitled} from "./home/owner-titled";

export const App = function () {
    return <div className="main-content-pushable">
        <Container className="main-content-pusher framed">
            <OwnerTitled>
                <Navigation renderMode={RenderMode.MENU}/>
                <Navigation renderMode={RenderMode.ROUTER}/>
            </OwnerTitled>
        </Container>
        <Footer/>
    </div>
};
