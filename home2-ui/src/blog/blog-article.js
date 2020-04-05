import React from "react";
import "../bbcode/tags";
import {Link} from "react-router-dom";
import {Button, Divider, Grid, Item, Segment} from "semantic-ui-react";
import {formatMarkup} from "../utils/text-markup";
import {formatDateTime} from "../utils/date-time";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {useAjax, useLoader} from "../context/ajax-context";
import _ from "lodash";
import {load} from "../data/reduce/article";
import {useImmutableSelector} from "../utils/redux-store";
import {Titled} from "react-titled";
import {OwnerCard} from "../home/owner-card";
import {LatestPosts} from "../home/latest-posts";

export const BlogArticle = function (props) {

    let ajax = useAjax();
    useLoader(load, ajax, props.id);

    let loading = useImmutableSelector("article", "loading");
    if (props.preview) {
        return <ArticleView {...props}/>
    }
    return <Grid centered stackable columns={2}>
        <Grid.Row>
            <Grid.Column width={11}>
                <ContentPlaceholderOr loading={loading === Loading.LOADING} lines={30}>
                    <ArticleView {...props}/>
                </ContentPlaceholderOr>
            </Grid.Column>
            <Grid.Column width={3}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
    </Grid>
};

export const ArticleView = function ({article = {}, id, href, preview}) {

    let loadedArticle = useImmutableSelector("article", "data");
    let loading = useImmutableSelector("article", "loading");

    if (loading === Loading.READY && loadedArticle && loadedArticle.id === id) {
        article = loadedArticle;
    }

    let articleLoading = _.isEmpty(article) && loading !== Loading.READY;

    return <Segment className="items">
        <Titled title={t => (article.title ? article.title + " | " : "") + " | Blog | " + t}/>
        <Item>
            <Item.Content>
                <ContentPlaceholderOr loading={articleLoading} lines={20}>
                    <Item.Header>
                        <Link to={href}>
                            <h1>{article.title}</h1>
                        </Link>
                    </Item.Header>
                    <Divider/>
                    {article.tags && article.tags.length > 0 && <Item.Meta>
                        {/*<Button.Group size="mini" compact>*/}
                        {article.tags.map(tag => <Button compact key={tag} size="mini">{tag}</Button>)}
                        {/*</Button.Group>*/}
                    </Item.Meta>}
                    <Item.Description>
                        {formatMarkup(article.content || '')}
                        {preview && <p/>}
                        {preview && <Link to={href} className="ui compact basic small button">
                            Read further
                        </Link>}
                    </Item.Description>
                    <Item.Extra>
                        {/*<Icon name="comment outline"/>*/}
                        {/*{this.props.comments.length} comments | */}
                        Created {formatDateTime(article.created)}
                    </Item.Extra>
                </ContentPlaceholderOr>
            </Item.Content>
        </Item>
    </Segment>
};