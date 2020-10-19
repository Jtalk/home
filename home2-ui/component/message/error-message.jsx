import {Message} from "semantic-ui-react";
import React from "react";

export const ErrorMessage = function ({message}) {
    return <Message error>
        <Message.Header>Error</Message.Header>
        {message}
    </Message>
};
