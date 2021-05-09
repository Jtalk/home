import React from "react";
import { OwnerTitled } from "../component/about/owner-titled";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import { preloadOwner, useOwner } from "../data/hooks/owner/get";
import dynamic from "next/dynamic";
import PreloadContext from "../data/preload/context";
import OwnerCard from "../component/about/owner-card";
import ContentPlaceholderOr from "../component/placeholder/content-placeholder";
import { Loading } from "../data/hooks/global/enums";
import { preloadFooter } from "../data/hooks/footer";
import { isSsrPreloadEnabled } from "../data/ajax/ssr";
import { dynamicSSR } from "../utils/dynamic-import";
import MarkdownTextArea from "../component/text-area";

const LatestPosts = dynamic(() => import("../component/about/latest-posts"), { ssr: dynamicSSR() });

export default function About({ preload }) {
  const { data: owner, loading } = useOwner();
  const { bio } = owner || {};

  return (
    <PreloadContext.Provider value={preload}>
      <Grid stackable centered>
        <OwnerTitled title={"About"} />
        <Grid.Row>
          <Grid.Column width={10} as="main">
            <ContentPlaceholderOr header lines={30} loading={loading === Loading.LOADING}>
              <MarkdownTextArea data-id="owner-bio">{bio}</MarkdownTextArea>
            </ContentPlaceholderOr>
          </Grid.Column>
          <Grid.Column width={4}>
            <OwnerCard />
            <LatestPosts />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </PreloadContext.Provider>
  );
}

export async function getServerSideProps(ctx) {
  const preload = {};
  if (isSsrPreloadEnabled()) {
    preload.owner = await preloadOwner();
    preload.footer = await preloadFooter();
  }
  return { props: { preload } };
}
