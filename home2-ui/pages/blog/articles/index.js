import React from "react";
import { DEFAULT_PAGE_SIZE, useArticles } from "../../../data/hooks/articles";
import { Loading } from "../../../data/hooks/global/enums";
import { useRouter } from "next/router";
import { BlogPath } from "../../../utils/paths";
import { OwnerTitled } from "../../../component/about/owner-titled";
import { ArticleView } from "../../../component/article/article-view";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import dynamic from "next/dynamic";
import { preloadOwner } from "../../../data/hooks/owner";
import { preloadFooter } from "../../../data/hooks/footer";
import { preloadArticles } from "../../../data/hooks/articles/list";

export default function Blog() {
  const router = useRouter();

  let { page = 1 } = router.query;
  page = parseInt(Array.isArray(page) ? page[0] : page);

  const { data: articles, pagination, loading } = useArticles(page - 1, DEFAULT_PAGE_SIZE);
  const totalCount = pagination?.total;

  const navigateToPage = async (page) => {
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
  if (loading || total === 0) {
    return null;
  }
  let currentIndex = page - 1;
  return (
    <Menu pagination data-id="articles-pagination">
      {Array(total || 1)
        .fill()
        .map((_, i) => {
          return (
            <Menu.Item
              data-id="page-button"
              key={i}
              name={`${i + 1}`}
              active={currentIndex === i}
              onClick={() => navigate(i + 1)}
            />
          );
        })}
    </Menu>
  );
};

export async function getServerSideProps({ query }) {
  const preload = {};
  preload.owner = await preloadOwner();
  preload.footer = await preloadFooter();
  preload.articles = await preloadArticles(query.page || 0);
  return { props: { preload } };
}
