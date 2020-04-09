import {Message} from "semantic-ui-react";
import React from "react";

export const InfoMessage = function ({header, children}) {
    return <Message>
        <Message.Header>{header}</Message.Header>
        <Message.Content>{children}</Message.Content>
    </Message>
};