import React from "react";
import Link from "next/link";
import {Button, Divider, Grid, Item, Segment} from "semantic-ui-react";
import {formatDateTime} from "../../../utils/date-time";
import {ContentPlaceholderOr} from "../../../component/placeholder";
import {Loading} from "../../../data/reduce/global/enums";
import {Titled} from "react-titled";
import {OwnerCard} from "../../../component/about/owner-card";
import {LatestPosts} from "../../../component/about/latest-posts";
import {articleActions, useArticle, useArticleLoading} from "../../../data/reduce/articles";
import {MarkdownTextArea} from "../../../component/text-area";
import {NotFound} from "../../../component/error/not-found";
import {useRouter} from "next/router";
import {PathPrefix} from "./index";
import {reduxWrapper} from "../../../data/redux";
import {ownerActions} from "../../../data/reduce/owner";
import {footerActions} from "../../../data/reduce/footer";
import {latestArticlesActions} from "../../../data/reduce/latest-articles";
import isEmpty from "lodash/isEmpty";

export default function ArticleId() {

    let router = useRouter();
    let {articleId} = router.query;
    let href = `${PathPrefix}/${articleId}`;

    let article = useArticle(articleId);
    let loading = useArticleLoading(articleId) || Loading.LOADING;
    if (!article && loading !== Loading.LOADING) {
        return <NotFound/>
    }
    return <>
        <Titled title={t => (article?.title ? article.title + " | " : "") + "Blog | " + t}/>
        <Grid centered stackable columns={2}>
            <Grid.Row>
                <Grid.Column width={11}>
                    <ArticleView article={article || {}} loading={loading} href={href}/>
                </Grid.Column>
                <Grid.Column width={3}>
                    <OwnerCard/>
                    <LatestPosts/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>
};

export const ArticleView = function ({article, loading, href, preview}) {

    let articleLoading = isEmpty(article) && loading !== Loading.READY;

    return <Segment className="items">
        <Item>
            <Item.Content>
                <ContentPlaceholderOr header lines={0} loading={articleLoading}>
                    <Item.Header>
                        <Link shallow={!preview} href={href}>
                            <a><h1>{article.title}</h1></a>
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
                        {preview && <Link href={href}>
                            <a className="ui compact basic small button">Read further</a>
                        </Link>}
                    </Item.Description>
                    <Item.Extra suppressHydrationWarning>
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

export const getServerSideProps = reduxWrapper.getServerSideProps(async ({store, query}) => {
    const {articleId} = query;
    await Promise.all([
        store.dispatch(ownerActions.load()),
        store.dispatch(articleActions.loadOne(articleId)),
        store.dispatch(latestArticlesActions.load()),
        store.dispatch(footerActions.load()),
    ])
    return {props: {}}
})
