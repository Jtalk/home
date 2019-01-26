import React from "react";
import {Container, Segment} from "semantic-ui-react";

class Footer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            links: [
                {caption: "About", url: "/index.html"},
                {caption: "Source", url: "https://bitbucket.org/__jtalk/home2"},
                {caption: "LinkedIn", url: "https://linkedin.com/in/jtalkme"},
                {caption: "BitBucket", url: "https://bitbucket.org/__jtalk/"},
                {caption: "StackOverflow", url: "https://stackoverflow.com/users/752977/roman-nazarenko"},
            ]
        }
    }


    render() {
        let linkElements = this.createLinks();
        return <Segment inverted basic className="footer" as="footer">
            <Container textAlign="center">
                <Segment inverted basic textAlign="center">
                    {linkElements}
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

    createLinks() {
        var result = this.state.links.flatMap(link => {
            return [
                <a href={link.url} key={link.caption}>{link.caption}</a>,
                ' | '
            ];
        });
        if (result.length > 1) {
            result.pop(); // Remove trailing "|"
        }
        return result;
    }
}

export default Footer;