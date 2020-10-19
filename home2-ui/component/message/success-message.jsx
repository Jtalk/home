import {Message} from "semantic-ui-react";
import React from "react";

export const SuccessMessage = function ({message}) {
    return <Message success>
        {message}
    </Message>
};
