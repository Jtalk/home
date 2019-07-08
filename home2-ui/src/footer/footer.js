import React from "react";
import {Container, Segment} from "semantic-ui-react";
import FlatLinksList from "./flat-links-list";
import FlatLogoList from "./flat-logo-list";
import * as footer from "../data/reduce/footer";
import {connect} from "react-redux";

export class Footer extends React.Component {

    render() {
        return <Segment inverted basic className="footer" as="footer" textAlign="center">
            <Container textAlign="center">
                <Segment inverted basic textAlign="center">
                    <FlatLinksList links={this.props.links} separator="|"/>
                </Segment>
                <FlatLogoList logos={this.props.logos}/>
            </Container>
        </Segment>
    }

    componentDidMount() {
        this.props.load();
    }
}


function mapStateToProps(state, oldProps) {
    let footerData = state.footer.get("data");
    return {
        links: footerData.get("links").toJS(),
        logos: footerData.get("logos").toJS(),
    }
}

const actions = {
    load: footer.load
};

export default connect(mapStateToProps, actions)(Footer);