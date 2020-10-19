import React from "react";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import List from "semantic-ui-react/dist/commonjs/elements/List";
import {formatDateTime} from "../../utils/date-time";
import {Loading} from "../../data/reduce/global/enums";
import Link from "next/link";
import "./latest-posts.module.css";
import {BlogPath} from "../../utils/paths";
import {ContentPlaceholderOr} from "../placeholder/content-placeholder";
import {useLatestArticles, useLatestArticlesLoading} from "../../data/reduce/latest-articles/hooks";

export const LatestPosts = function () {

    let posts = useLatestArticles();
    let loading = useLatestArticlesLoading();

    let latestPostElements = posts.map(post =>
        createPostItem(post)
    );
    return <Card>
        <Card.Content>
            <Card.Header>Latest Posts</Card.Header>
            <Card.Description>
                <Divider/>
                <ContentPlaceholderOr loading={loading === Loading.LOADING} lines={6}>
                    <List>
                        {latestPostElements}
                    </List>
                </ContentPlaceholderOr>
            </Card.Description>
        </Card.Content>
    </Card>
};

function createPostItem(post) {
    return <List.Item key={post.title}>
        <List.Content>
            <List.Header as="h4">
                <Link href={`${BlogPath}/${post.id}`}>
                    <a>{post.title}</a>
                </Link>
            </List.Header>
            <List.Description>
                <div suppressHydrationWarning className="datetime">{formatDateTime(post.created)}</div>
            </List.Description>
        </List.Content>
    </List.Item>
}
