import React from "react";
import { Loading } from "../data/hooks/global/enums";
import { OwnerTitled } from "../component/about/owner-titled";
import { ContentPlaceholderOr } from "../component/placeholder/content-placeholder";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import { useOwner, useOwnerLoading } from "../data/hooks/owner/get";
import dynamic from "next/dynamic";

export default function About() {
  const { bio } = useOwner() || {};
  const loading = useOwnerLoading();

  const MarkdownTextArea = dynamic(() => import("../component/text-area"));
  const OwnerCard = dynamic(() => import("../component/about/owner-card"));
  const LatestPosts = dynamic(() => import("../component/about/latest-posts"));

  return (
    <Grid stackable centered>
      <OwnerTitled title={"About"} />
      <Grid.Row>
        <Grid.Column width={10} as="main">
          <ContentPlaceholderOr header lines={30} loading={!MarkdownTextArea || loading === Loading.LOADING}>
            <MarkdownTextArea>{bio}</MarkdownTextArea>
          </ContentPlaceholderOr>
        </Grid.Column>
        <Grid.Column width={4}>
          <OwnerCard />
          <LatestPosts />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export async function getServerSideProps(ctx) {
  // Do nothing, disable automatic static optimisation to access Next Config.
  return { props: {} };
}
