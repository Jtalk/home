import React from "react";
import {Container} from "semantic-ui-react";
import {Titled} from "react-titled";

export const WebError = function ({httpCode, message}) {

    return <Titled title={() => httpCode}>
        <Container text textAlign="center">
            {httpCode}: {message}
        </Container>
    </Titled>
};
