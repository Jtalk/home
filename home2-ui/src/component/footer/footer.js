import React from "react";
import {Container, Segment} from "semantic-ui-react";
import {FlatLinksList} from "./flat-links-list";
import {FlatLogoList} from "./flat-logo-list";
import {useFooter} from "../../data/reduce/footer";
import "./footer.module.css";

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
