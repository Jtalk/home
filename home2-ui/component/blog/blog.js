import React from "react";
import {ArticleView} from "./blog-article";
import {Grid, Menu, Segment} from "semantic-ui-react";
import {OwnerCard} from "../about/owner-card";
import {LatestPosts} from "../about/latest-posts";
import {useHistory} from "react-router-dom";
import {DEFAULT_PAGE_SIZE, useArticles, useArticlesLoading, useArticlesTotalCount} from "../../data/reduce/articles";
import {Loading} from "../../data/reduce/global/enums";
import {Titled} from "react-titled";
import {routeConcat, useActiveRoute} from "../../navigation/active-route-context";
import {useQueryParam} from "../../navigation/query";

export const Blog = function () {

    let history = useHistory();

    let page = useQueryParam("page", 1);
    let path = useActiveRoute();

    let articles = useArticles(page - 1, DEFAULT_PAGE_SIZE);
    let totalCount = useArticlesTotalCount();
    let loading = useArticlesLoading();

    let navigateToPage = (page) => {
        history.push(path + `?page=${page}`)
    };

    return <Grid centered stackable columns={2}>
        <Titled title={t => "Blog | " + t}/>
        <Grid.Row>
            <Grid.Column width={11}>
                <BlogArticles loading={loading} articles={articles} blogPathPrefix={path}/>
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

export const BlogArticles = function ({loading, articles, blogPathPrefix}) {
    if (loading === Loading.LOADING) {
        articles = Array(5).fill({});
    }
    return articles.map((article, i) => <ArticleView preview key={i}
                                                article={article}
                                                loading={loading}
                                                href={routeConcat(blogPathPrefix, article.id)}/>)
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
