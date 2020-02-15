import React from "react";
import {Message} from "semantic-ui-react";

export class ErrorMessage extends React.Component {

    render() {
        return <Message error>
            <Message.Header>Error:</Message.Header>
            {this.props.message}
        </Message>
    }
}

export class SuccessMessage extends React.Component {

    render() {
        return <Message success>
            {this.props.message}
        </Message>
    }
}