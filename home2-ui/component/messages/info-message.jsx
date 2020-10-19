import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const InfoMessage = function ({header, children}) {
    return <Message>
        <Message.Header>{header}</Message.Header>
        <p>
            {children}
        </p>
    </Message>
};
