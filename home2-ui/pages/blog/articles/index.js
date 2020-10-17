import React from "react";
import {ArticleView} from "./[articleId]";
import {Grid, Menu, Segment} from "semantic-ui-react";
import {OwnerCard} from "../../../component/about/owner-card";
import {LatestPosts} from "../../../component/about/latest-posts";
import {DEFAULT_PAGE_SIZE, useArticles, useArticlesLoading, useArticlesTotalCount} from "../../../data/reduce/articles";
import {Loading} from "../../../data/reduce/global/enums";
import {Titled} from "react-titled";
import {useRouter} from "next/router";

export const PathPrefix = "/blog/articles";

export default function Blog() {

    let router = useRouter();

    let {page = 1} = router.query;
    page = parseInt(Array.isArray(page) ? page[0] : page);

    let articles = useArticles(page - 1, DEFAULT_PAGE_SIZE);
    let totalCount = useArticlesTotalCount();
    let loading = useArticlesLoading();

    let navigateToPage = async (page) => {
        await router.push(`${PathPrefix}?page=${page}`, undefined, { shallow: true });
    };

    return <Grid centered stackable columns={2}>
        <Titled title={t => "Blog | " + t}/>
        <Grid.Row>
            <Grid.Column width={11}>
                <BlogArticles loading={loading} articles={articles}/>
            </Grid.Column>
            <Grid.Column width={3}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Segment floated="right" basic compact>
                <Pagination loading={loading === Loading.LOADING} total={totalCount} page={page} navigate={navigateToPage}/>
            </Segment>
        </Grid.Row>
    </Grid>
};

export const BlogArticles = function ({loading, articles}) {
    if (loading === Loading.LOADING) {
        articles = Array(5).fill({});
    }
    return articles.map((article, i) => <ArticleView preview key={i}
                                                article={article}
                                                loading={loading}
                                                href={`${PathPrefix}/${article.id}`}/>)
};

export const Pagination = function ({loading, total, page, navigate}) {
    if (loading) {
        return null;
    }
    let currentIndex = page - 1;
    return <Menu pagination>
        {
            Array(total || 1).fill().map((_, i) => {
                return <Menu.Item key={i} name={`${i + 1}`} active={currentIndex === i}
                                  onClick={() => navigate(i + 1)}/>
            })
        }
    </Menu>
};
