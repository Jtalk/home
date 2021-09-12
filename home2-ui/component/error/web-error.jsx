import React from "react";
import { reportError } from "../../utils/error-reporting";
import Head from "next/head";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";
import { useRouter } from "next/router";

export const WebError = function ({ httpCode, message }) {
  const router = useRouter();
  const path = router.asPath || router.pathname;
  if (httpCode === 404 && !is404Ignored(path)) {
    console.error("Showing error page at", path, httpCode, message);
    reportError({
      errorClass: "error-page",
      errorMessage: `Showing error page at ${path}: ${httpCode} ${message}`,
    });
  }
  return (
    <Container text textAlign="center" data-id="error-page">
      <Head>
        <title>{message}</title>
      </Head>
      {httpCode}: {message}
    </Container>
  );
};

const ignore404 = [
  /\.php(\?|$)/i,
  /asset-manifest.json$/i,
  /\/(\.env|feed|ads\.txt|wp-\w+|wp\d|wp$|wp\/|rss\.xml|console|admin(istrator)?|vendor|bak|new-site|v\d|temp|\d{4}|dev|web|old(-\w+)?|cms|demo|backup)/i,
  /\/(site|test|main|new|wordpress|bk|adm|ics|m8s|aws\.yml|phpinfo|_profiler|manager|uploads|user|files|_ignition|plugins|_controls)/i,
  /\/(\.git|DesktopModules|providers|Install|app_master|\.well-known|stalker_portal|c|home\/resources)/i,
  /\/(\w+\/)?(login|sign.in)/i,
  /\/.*\.aspx?/i,
  /\/javax\.faces\.resource\//i,
  /\/images$/,
  /\/index\.rdf/i,
  /\/rss.xml/i,
  /\/\.well-known\/(acme-challenge\/|security.txt)/i,
  /\/humans.txt/i,
];
function is404Ignored(path) {
  for (const ignored of ignore404) {
    if (ignored.exec(path)) return true;
  }
  return false;
}
