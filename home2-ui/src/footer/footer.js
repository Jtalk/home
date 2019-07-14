import React, {useEffect} from "react";
import {Container, Segment} from "semantic-ui-react";
import FlatLinksList from "./flat-links-list";
import FlatLogoList from "./flat-logo-list";
import * as footer from "../data/reduce/footer";
import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../utils/redux-store";

export const Footer = function ({footerLoader}) {

    let links = useImmutableSelector("footer", ["data", "links"]) || [];
    let logos = useImmutableSelector("footer", ["data", "logos"]) || [];
    let dispatch = useDispatch();
    let loader = footerLoader || footer.load;

    useEffect(() => { dispatch(loader()); }, [loader, footerLoader, dispatch]);

    return <StatelessFooter {...{links, logos}}/>
};

export const StatelessFooter = function (props) {

    return <Segment inverted basic className="footer" as="footer" textAlign="center">
        <Container textAlign="center">
            <Segment inverted basic textAlign="center">
                <FlatLinksList links={props.links} separator="|"/>
            </Segment>
            <FlatLogoList logos={props.logos}/>
        </Container>
    </Segment>
};