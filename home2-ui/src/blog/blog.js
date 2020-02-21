import React from "react";
import {BlogArticle} from "./blog-article";
import {Grid, Menu, Segment} from "semantic-ui-react";
import {OwnerCard} from "../home/owner-card";
import {LatestPosts} from "../home/latest-posts";
import {Link, Route} from "react-router-dom";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjax, useLoader} from "../context/ajax-context";
import {loadPagePublished} from "../data/reduce/articles";
import _ from "lodash";
import {useQueryParam} from "../utils/routing";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";

export const Blog = function () {

    let page = useQueryParam("page", 1);
    let ajax = useAjax();

    useLoader(loadPagePublished, ajax, page - 1);

    let articles = useImmutableSelector("articles", "data", "articles");
    let pagination = useImmutableSelector("articles", "data", "pagination");
    let loading = useImmutableSelector("articles", "loading");

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
                        <Pagination pagination={pagination} page={page}/>
                    </Segment>
                </Grid.Row>,
            () => null
        )}
    </Grid>
};

export const Pagination = function ({pagination, page}) {
    let currentIndex = page - 1;
    return <Menu pagination>
        {
            Array(pagination.total || 1).fill().map((_, i) => {
                if (currentIndex === i) {
                    return <Menu.Item key={i}>{i + 1}</Menu.Item>
                } else {
                    return <Link key={i} to={"/blog/articles?page=" + (i + 1)} className="ui menu item">{i + 1}</Link>
                }
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