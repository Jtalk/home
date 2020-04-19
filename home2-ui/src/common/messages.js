import {Message} from "semantic-ui-react";
import React from "react";

export const InfoMessage = function ({header, children}) {
    return <Message>
        <Message.Header>{header}</Message.Header>
        <p>
            {children}
        </p>
    </Message>
};