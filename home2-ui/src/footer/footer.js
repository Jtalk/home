import React from "react";
import {Container, Segment} from "semantic-ui-react";
import FlatLinksList from "./flat-links-list";

class Footer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            links: [
                {name: "About", href: "/index.html"},
                {name: "Source", href: "https://bitbucket.org/__jtalk/home2"},
                {name: "LinkedIn", href: "https://linkedin.com/in/jtalkme"},
                {name: "BitBucket", href: "https://bitbucket.org/__jtalk/"},
                {name: "StackOverflow", href: "https://stackoverflow.com/users/752977/roman-nazarenko"},
            ]
        }
    }

    render() {
        return <Segment inverted basic className="footer" as="footer">
            <Container textAlign="center">
                <Segment inverted basic textAlign="center">
                    <FlatLinksList links={this.state.links} splitter="|"/>
                </Segment>
                <a href="https://java.com">
                    <img src="/images/logo_java.png" alt="Java Logo" height="55"/>
                </a>
                <a href="https://www.gnu.org/licenses/agpl-3.0.html">
                    <img src="/images/logo_agplv3.svg" height="40" alt="GNU AGPL Logo"
                         style={{marginLeft: '30px !important'}}/>
                </a>
            </Container>
        </Segment>
    }
}

export default Footer;