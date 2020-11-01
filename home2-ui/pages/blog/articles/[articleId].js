import React from "react";
import {Loading} from "../../../data/reduce/global/enums";
import {OwnerCard} from "../../../component/about/owner-card";
import {LatestPosts} from "../../../component/about/latest-posts";
import {articleActions, useArticle, useArticleLoading} from "../../../data/reduce/articles";
import {NotFound} from "../../../component/error/not-found";
import {useRouter} from "next/router";
import {reduxWrapper} from "../../../data/redux";
import {BlogPath} from "../../../utils/paths";
import {OwnerTitled} from "../../../component/about/owner-titled";
import {ArticleView} from "../../../component/article/article-view";
import {latestArticlesActions} from "../../../data/reduce/latest-articles/actions";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";

export default function ArticleId() {

    let router = useRouter();
    let {articleId} = router.query;
    let href = `${BlogPath}/${articleId}`;

    let article = useArticle(articleId);
    let loading = useArticleLoading(articleId) || Loading.LOADING;
    if (!article && loading !== Loading.LOADING) {
        return <NotFound/>
    }
    return <>
        <OwnerTitled title={"Articles"} subtitle={article?.title}/>
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

export const getServerSideProps = reduxWrapper.getServerSideProps(async ({store, query}) => {
    const {articleId} = query;
    await Promise.all([
        store.dispatch(articleActions.loadOne(articleId)),
        store.dispatch(latestArticlesActions.load()),
    ])
    return {props: {}}
})
