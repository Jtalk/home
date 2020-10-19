import React from "react";
import {reportError} from "../../utils/error-reporting";
import Head from "next/head";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";

export const WebError = function ({httpCode, message}) {
    console.error("Showing error page", httpCode, message);
    reportError({errorClass: "error-page", errorMessage: `Showing error page: ${httpCode} ${message}`});
    return <Container text textAlign="center">
        <Head>
            <title>{message}</title>
        </Head>
        {httpCode}: {message}
    </Container>
};
