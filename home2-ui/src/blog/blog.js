import React from "react";
import {BlogArticle} from "./blog-article";
import {Grid, Menu, Segment} from "semantic-ui-react";
import {OwnerCard} from "../home/owner-card";
import {LatestPosts} from "../home/latest-posts";
import {useHistory} from "react-router-dom";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjax, useLoader} from "../context/ajax-context";
import {loadPagePublished} from "../data/reduce/articles";
import {useQueryParam} from "../utils/routing";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {Titled} from "react-titled";
import {routeConcat, useActiveRoute} from "../navigation/active-route-context";

export const Blog = function () {

    let ajax = useAjax();
    let history = useHistory();

    let page = useQueryParam("page", 1);
    let path = useActiveRoute();

    useLoader(loadPagePublished, ajax, page - 1);

    let articles = useImmutableSelector("articles", "data", "articles");
    let pagination = useImmutableSelector("articles", "data", "pagination");
    let loading = useImmutableSelector("articles", "loading");

    let navigateToPage = (page) => {
        history.push(path + `?page=${page}`)
    };

    return <Grid centered stackable columns={2}>
        <Titled title={t => "Blog | " + t}/>
        <Grid.Row>
            <Grid.Column width={11}>
                <ContentPlaceholderOr loading={loading === Loading.LOADING} lines={30}>
                    {articles.map(article => <BlogArticle preview key={article.id} id={article.id} href={routeConcat(path, article.id)} article={article} />)}
                </ContentPlaceholderOr>
            </Grid.Column>
            <Grid.Column width={3}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
            <Grid.Row>
                <Segment floated="right" basic compact>
                    <Pagination pagination={pagination} page={page} navigate={navigateToPage}/>
                </Segment>
            </Grid.Row>
    </Grid>
};

export const Pagination = function ({pagination, page, navigate}) {
    let currentIndex = page - 1;
    return <Menu pagination>
        {
            Array(pagination.total || 1).fill().map((_, i) => {
                return <Menu.Item key={i} name={`${i + 1}`} active={currentIndex === i} onClick={() => navigate(i + 1)}/>
            })
        }
    </Menu>
};
