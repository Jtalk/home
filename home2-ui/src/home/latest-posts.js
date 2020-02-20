import React from "react";
import {Card, Divider, List} from "semantic-ui-react";
import {formatDateTime} from "../utils/date-time";
import {useAjax, useLoader} from "../context/ajax-context";
import {load} from "../data/reduce/latest-articles";
import {useImmutableSelector} from "../utils/redux-store";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {Link} from "react-router-dom";
import "./latest-posts.css";

const PREVIEW_SIZE = 3;

export const LatestPosts = function () {

    let ajax = useAjax();

    useLoader(load, ajax, PREVIEW_SIZE);

    let posts = useImmutableSelector("latest-articles", "data");
    let loading = useImmutableSelector("latest-articles", "loading");

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
                <Link to={`/blog/articles/${post.id}`}>{post.title}</Link>
            </List.Header>
            <List.Description>
                <div className="datetime">{formatDateTime(post.created)}</div>
            </List.Description>
        </List.Content>
    </List.Item>
}
