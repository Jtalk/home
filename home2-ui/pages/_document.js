import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="images/icon32.png" />
          <link rel="alternate" type="application/atom+xml" title="Atom 1.0" href="api/atom.xml" />
          <meta name="theme-color" content="#000000" />
          <link rel="manifest" href="manifest.json" />
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
