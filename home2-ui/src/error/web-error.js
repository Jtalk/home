import React from "react";
import "../bbcode/tags";
import {Container} from "semantic-ui-react";

class WebError extends React.Component {

    render() {
        return <Container text textAlign="center">
            {this.props.httpCode}: {this.props.message}
        </Container>
    }

    componentDidMount() {
        document.title = this.props.httpCode;
    }
}

export default WebError;