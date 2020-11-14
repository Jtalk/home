import React from "react";
import { reportError } from "../../utils/error-reporting";
import Head from "next/head";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";
import { useRouter } from "next/router";

export const WebError = function ({ httpCode, message }) {
  const router = useRouter();
  console.error("Showing error page at", router.asPath || router.pathname, httpCode, message);
  reportError({
    errorClass: "error-page",
    errorMessage: `Showing error page at ${router.asPath || router.pathname}: ${httpCode} ${message}`,
  });
  return (
    <Container text textAlign="center">
      <Head>
        <title>{message}</title>
      </Head>
      {httpCode}: {message}
    </Container>
  );
};
