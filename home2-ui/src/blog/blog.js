import React from "react";
import {BlogArticle} from "./blog-article";
import {Grid, Menu, Segment} from "semantic-ui-react";
import {OwnerCard} from "../home/owner-card";
import {LatestPosts} from "../home/latest-posts";
import {Link, Route, useHistory} from "react-router-dom";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjax, useLoader} from "../context/ajax-context";
import {loadPagePublished} from "../data/reduce/articles";
import _ from "lodash";
import {useQueryParam} from "../utils/routing";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";

export const Blog = function () {

    let ajax = useAjax();
    let history = useHistory();

    let page = useQueryParam("page", 1);

    useLoader(loadPagePublished, ajax, page - 1);

    let articles = useImmutableSelector("articles", "data", "articles");
    let pagination = useImmutableSelector("articles", "data", "pagination");
    let loading = useImmutableSelector("articles", "loading");

    let navigateToPage = (page) => {
        history.push(`/blog/articles?page=${page}`)
    };

    return <Grid centered stackable columns={2}>
        <Grid.Row>
            <Grid.Column width={11}>
                <ContentPlaceholderOr loading={loading === Loading.LOADING} lines={30}>
                    {
                        blogRouting(
                            () => articles.map(article => <BlogArticle preview key={article.title} id={article.id} href={`/blog/articles/${article.id}`} article={article} />),
                            articleId => {
                                let article = _.find(articles, a => a.id === articleId);
                                return <BlogArticle href={`/blog/articles/${articleId}`} id={articleId} article={article}/>
                            })
                    }
                </ContentPlaceholderOr>
            </Grid.Column>
            <Grid.Column width={3}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
        {
            blogRouting(
            () =>
                <Grid.Row>
                    <Segment floated="right" basic compact>
                        <Pagination pagination={pagination} page={page} navigate={navigateToPage}/>
                    </Segment>
                </Grid.Row>,
            () => null
        )}
    </Grid>
};

export const Pagination = function ({pagination, page, navigate}) {
    let currentIndex = page - 1;
    return <Menu pagination>
        {
            Array(pagination.total || 1).fill().map((_, i) => {
                return <Menu.Item key={i} name={i + 1} active={currentIndex === i} onClick={() => navigate(i + 1)}/>
            })
        }
    </Menu>
};

function blogRouting(indexRender, articleRender) {
    return [
        <Route exact key="blog" path="/blog/articles" render={() => indexRender()}/>,
        <Route exact key="article" path="/blog/articles/:articleId"
               render={param => articleRender(param.match.params.articleId)}/>
    ]
}