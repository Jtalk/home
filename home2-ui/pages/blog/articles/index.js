import React from "react";
import {
  DEFAULT_PAGE_SIZE,
  useArticles,
  useArticlesLoading,
  useArticlesTotalCount,
} from "../../../data/hooks/articles";
import { Loading } from "../../../data/hooks/global/enums";
import { useRouter } from "next/router";
import { BlogPath } from "../../../utils/paths";
import { OwnerTitled } from "../../../component/about/owner-titled";
import { ArticleView } from "../../../component/article/article-view";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import dynamic from "next/dynamic";

export default function Blog() {
  let router = useRouter();

  let { page = 1 } = router.query;
  page = parseInt(Array.isArray(page) ? page[0] : page);

  let articles = useArticles(page - 1, DEFAULT_PAGE_SIZE);
  let totalCount = useArticlesTotalCount(page - 1, DEFAULT_PAGE_SIZE);
  let loading = useArticlesLoading(page - 1, DEFAULT_PAGE_SIZE);

  let navigateToPage = async (page) => {
    await router.push(`${BlogPath}?page=${page}`, undefined, { shallow: true });
  };

  const OwnerCard = dynamic(() => import("../../../component/about/owner-card"));
  const LatestPosts = dynamic(() => import("../../../component/about/latest-posts"));

  return (
    <Grid centered stackable columns={2}>
      <OwnerTitled title={"Articles"} />
      <Grid.Row>
        <Grid.Column width={11}>
          <BlogArticles loading={loading} articles={articles} />
        </Grid.Column>
        <Grid.Column width={3}>
          <OwnerCard />
          <LatestPosts />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Segment floated="right" basic compact>
          <Pagination loading={loading === Loading.LOADING} total={totalCount} page={page} navigate={navigateToPage} />
        </Segment>
      </Grid.Row>
    </Grid>
  );
}

const BlogArticles = function ({ loading, articles }) {
  if (loading === Loading.LOADING) {
    articles = Array(5).fill({});
  }
  return articles.map((article, i) => (
    <ArticleView preview key={i} article={article} loading={loading} href={`${BlogPath}/${article.id}`} />
  ));
};

const Pagination = function ({ loading, total, page, navigate }) {
  if (loading) {
    return null;
  }
  let currentIndex = page - 1;
  return (
    <Menu pagination>
      {Array(total || 1)
        .fill()
        .map((_, i) => {
          return <Menu.Item key={i} name={`${i + 1}`} active={currentIndex === i} onClick={() => navigate(i + 1)} />;
        })}
    </Menu>
  );
};
