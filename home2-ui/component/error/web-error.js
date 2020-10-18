import React from "react";
import {Container} from "semantic-ui-react";
import {Titled} from "react-titled";
import {reportError} from "../../utils/error-reporting";

export const WebError = function ({httpCode, message}) {
    console.error("Showing error page", httpCode, message);
    reportError({errorClass: "error-page", errorMessage: `Showing error page: ${httpCode} ${message}`});
    return <Titled title={() => message}>
        <Container text textAlign="center">
            {httpCode}: {message}
        </Container>
    </Titled>
};
