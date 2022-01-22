import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import crypto from "crypto";
import getConfig from "next/config";

const isDev = process.env.NODE_ENV !== "production";
const apiUrl = new URL(getConfig().publicRuntimeConfig.api.prefix);
const apiHost = `${apiUrl.protocol}//${apiUrl.hostname}`;

const CSPHeader = "Content-Security-Policy";
const CSPValue = (nonce) =>
  "default-src 'self';" +
  `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""};` +
  "style-src * 'unsafe-inline';" +
  "img-src * data:;" + // We use data: for image uploader
  "font-src 'self' data: fonts.gstatic.com fonts.googleapis.com;" +
  "media-src *;" +
  `connect-src 'self' *.bugsnag.com ${apiHost};` +
  "object-src 'none';" +
  "child-src 'none';" +
  "frame-src 'none';" +
  (isDev ? "" : "upgrade-insecure-requests");

export default class MyDocument extends Document {
  render() {
    const nonce = crypto.randomBytes(16).toString("base64");

    return (
      <Html lang="en">
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta httpEquiv={CSPHeader} content={CSPValue(nonce)} />
          <link rel="shortcut icon" href="/images/icon32.png" />
          <link rel="alternate" type="application/atom+xml" title="Atom 1.0" href="/api/atom.xml" />
          <meta name="theme-color" content="#000000" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body className="pushable">
          <div className="pusher">
            <Main />
          </div>
          <NextScript />
        </body>
      </Html>
    );
  }
}
