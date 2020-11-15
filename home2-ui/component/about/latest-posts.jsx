import React from "react";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import List from "semantic-ui-react/dist/commonjs/elements/List";
import { formatDateTime } from "../../utils/date-time";
import { Loading } from "../../data/hooks/global/enums";
import Link from "next/link";
import "./latest-posts.module.css";
import { BlogPath } from "../../utils/paths";
import { ContentPlaceholderOr } from "../placeholder/content-placeholder";
import { useLatestArticles } from "../../data/hooks/latest-articles";

const PREVIEW_SIZE = 3;

export default function LatestPosts() {
  const { data: posts = [], loading } = useLatestArticles(PREVIEW_SIZE);

  if (!posts?.length) return null;
  const latestPostElements = posts.map((post) => createPostItem(post));
  return (
    <Card data-id="latest-posts">
      <Card.Content>
        <Card.Header data-id="latest-posts-header" as="h3">
          Latest Posts
        </Card.Header>
        <Card.Description>
          <Divider />
          <ContentPlaceholderOr loading={loading === Loading.LOADING} lines={6}>
            <List data-id="latests-posts-list">{latestPostElements}</List>
          </ContentPlaceholderOr>
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

function createPostItem(post) {
  return (
    <List.Item data-id="latest-post" key={post.title}>
      <List.Content>
        <List.Header data-id="latest-post-caption" as="h4">
          <Link href={`${BlogPath}/${post.id}`}>
            <a>{post.title}</a>
          </Link>
        </List.Header>
        <List.Description>
          <div data-id="latest-post-created-timestamp" suppressHydrationWarning className="datetime">
            {formatDateTime(post.created)}
          </div>
        </List.Description>
      </List.Content>
    </List.Item>
  );
}
