import React from "react";
import Container from "semantic-ui-react/dist/commonjs/elements/Container"
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment"
import {FlatLinksList} from "./flat-links-list";
import {FlatLogoList} from "./flat-logo-list";
import "./footer.module.css";
import {useFooter} from "../../data/reduce/footer/hooks";

export const Footer = function () {
    let {links, logos} = useFooter();
    return <StatelessFooter {...{links, logos}}/>
};

export const StatelessFooter = function (props) {

    return <Segment inverted basic className="footer" as="footer" textAlign="center">
        <Container textAlign="center">
            <FlatLinksList links={props.links} separator="|"/>
            <FlatLogoList className="logos" logos={props.logos}/>
            <p>Copyright (C) 2020 Roman Nazarenko </p>
        </Container>
    </Segment>
};
