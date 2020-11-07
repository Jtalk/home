import React from "react";
import { Loading } from "../../../data/hooks/global/enums";
import { useArticle, useArticleLoading } from "../../../data/hooks/articles/get";
import { NotFound } from "../../../component/error/not-found";
import { useRouter } from "next/router";
import { BlogPath } from "../../../utils/paths";
import { OwnerTitled } from "../../../component/about/owner-titled";
import { ArticleView } from "../../../component/article/article-view";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import dynamic from "next/dynamic";

export default function ArticleId() {
  let router = useRouter();
  let { articleId } = router.query;
  let href = `${BlogPath}/${articleId}`;

  let article = useArticle(articleId);
  let loading = useArticleLoading(articleId) || Loading.LOADING;
  if (!article && loading !== Loading.LOADING) {
    return <NotFound />;
  }

  const OwnerCard = dynamic(() => import("../../../component/about/owner-card"));
  const LatestPosts = dynamic(() => import("../../../component/about/latest-posts"));

  return (
    <>
      <OwnerTitled title={"Articles"} subtitle={article?.title} />
      <Grid centered stackable columns={2}>
        <Grid.Row>
          <Grid.Column width={11}>
            <ArticleView article={article || {}} loading={loading} href={href} />
          </Grid.Column>
          <Grid.Column width={3}>
            <OwnerCard />
            <LatestPosts />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}

export async function getServerSideProps(ctx) {
  // Do nothing, disable automatic static optimisation to access Next Config.
  return { props: {} };
}
