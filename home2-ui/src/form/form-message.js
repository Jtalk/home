import React from "react";
import {Message} from "semantic-ui-react";

export const ErrorMessage = function ({message}) {
    return <Message error>
        <Message.Header>Error:</Message.Header>
        {message}
    </Message>
};

export const SuccessMessage = function ({message}) {
    return <Message success>
        {message}
    </Message>
};