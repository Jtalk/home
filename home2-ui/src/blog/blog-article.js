import React from "react";
import "../bbcode/tags";
import {Link} from "react-router-dom";
import {Button, Divider, Grid, Item, Segment} from "semantic-ui-react";
import {formatDateTime} from "../utils/date-time";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import _ from "lodash";
import {Titled} from "react-titled";
import {OwnerCard} from "../home/owner-card";
import {LatestPosts} from "../home/latest-posts";
import {useArticle, useArticlesLoading} from "../data/reduce/articles";
import {MarkdownTextArea} from "../shared/text-area";

export const BlogArticle = function (props) {

    let loading = useArticlesLoading();
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

export const ArticleView = function ({id, href, preview}) {

    let article = useArticle(id);
    let loading = useArticlesLoading();

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
                        <MarkdownTextArea>{article.content || ''}</MarkdownTextArea>
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