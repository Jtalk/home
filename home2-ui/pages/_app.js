import React from "react";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import "highlight.js/styles/idea.css";
import { setupErrorReporting } from "../utils/error-reporting";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useLoggedIn } from "../data/hooks/authentication";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";
import withAuthentication from "../data/hooks/authentication/with-authentication";
import PreloadContext from "../data/preload/context";
import Footer from "../component/footer/footer";
import HeaderDesktop from "../component/header/header-desktop";
import HeaderMobile from "../component/header/header-mobile";

const { ErrorBoundary } = setupErrorReporting();

function App({ Component, pageProps }) {
  const isLoggedIn = useLoggedIn();
  const router = useRouter();
  const disableSSR = !process.browser && router.pathname.startsWith("/admin");
  if (disableSSR) {
    console.info(`SSR disabled for admin page ${router.pathname}`);
    Component = dynamic(() => Promise.resolve(Component), { ssr: false });
  }
  if (process.browser && router.pathname.startsWith("/admin") && !isLoggedIn) {
    Component = dynamic(() => import("../component/error/not-found").then((i) => i.default));
  }

  return (
    <ErrorBoundary>
      <PreloadContext.Provider value={pageProps?.preload || {}}>
        <div className="main-content-pushable">
          <HeaderMobile />
          <Container className="main-content-pusher desktop-framed">
            <HeaderDesktop />
            <Component {...pageProps} />
          </Container>
          <ErrorBoundary FallbackComponent={<div />}>
            <Footer />
          </ErrorBoundary>
        </div>
      </PreloadContext.Provider>
    </ErrorBoundary>
  );
}

App.getInitialProps = async ({ ctx }) => {
  // Does nothing but disabling SSP so that components could access API data.
  // We rely on components' getServerSideProps for the actual SSR
  return {};
};

export default withAuthentication(App);
