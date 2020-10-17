import React from "react";
import {Link} from "react-router-dom";
import {Button, Divider, Grid, Item, Segment} from "semantic-ui-react";
import {formatDateTime} from "../../utils/date-time";
import {ContentPlaceholderOr} from "../placeholder";
import {Loading} from "../../data/reduce/global/enums";
import _ from "lodash";
import {Titled} from "react-titled";
import {OwnerCard} from "../about/owner-card";
import {LatestPosts} from "../about/latest-posts";
import {useArticle, useArticleLoading} from "../../data/reduce/articles";
import {MarkdownTextArea} from "../text-area";
import {NotFound} from "../error/not-found";

export const BlogArticle = function (props) {

    let article = useArticle(props.id);
    let loading = useArticleLoading(props.id) || Loading.LOADING;
    if (!article && loading !== Loading.LOADING) {
        return <NotFound/>
    }
    return <Grid centered stackable columns={2}>
        <Grid.Row>
            <Grid.Column width={11}>
                <ArticleView article={article || {}} loading={loading} {...props}/>
            </Grid.Column>
            <Grid.Column width={3}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
    </Grid>
};

export const ArticleView = function ({article, loading, href, preview}) {

    let articleLoading = _.isEmpty(article) && loading !== Loading.READY;

    return <Segment className="items">
        <Titled title={t => (article.title ? article.title + " | " : "") + " | Blog | " + t}/>
        <Item>
            <Item.Content>
                <ContentPlaceholderOr header lines={0} loading={articleLoading}>
                    <Item.Header>
                        <Link to={href}>
                            <h1>{article.title}</h1>
                        </Link>
                    </Item.Header>
                </ContentPlaceholderOr>
                <Divider/>
                <ContentPlaceholderOr header lines={10} loading={articleLoading}>
                    {article.tags && article.tags.length > 0 && <Item.Meta>
                        {article.tags.map(tag => <Button compact key={tag} size="mini">{tag}</Button>)}
                    </Item.Meta>}
                    <Item.Description>
                        <MarkdownTextArea preview={preview}>{article.content || ''}</MarkdownTextArea>
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

export function blogArticleHref(id) {
    return `/blog/articles/${id}`;
}
