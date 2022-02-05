import isEmpty from "lodash/isEmpty";
import { Loading } from "../../data/hooks/global/enums";
import { ContentPlaceholderOr } from "../placeholder/content-placeholder";
import Link from "next/link";
import MarkdownTextArea from "../text-area";
import { formatDateTime } from "../../utils/date-time";
import React from "react";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Item from "semantic-ui-react/dist/commonjs/views/Item";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import styles from "./article-view.module.css";

export const ArticleView = function ({ article, loading, href, preview }) {
  const articleLoading = isEmpty(article) && loading !== Loading.READY;

  return (
    <Segment className="items">
      <Item data-id="blog-article-view">
        <Item.Content className={styles.articleContent}>
          <ContentPlaceholderOr header lines={0} loading={articleLoading}>
            <Item.Header data-id="header">
              <Link shallow={!preview} href={href}>
                <a>
                  <h1>{article.title}</h1>
                </a>
              </Link>
            </Item.Header>
          </ContentPlaceholderOr>
          <Divider />
          <ContentPlaceholderOr header lines={10} loading={articleLoading}>
            {article.tags && article.tags.length > 0 && (
              <Item.Meta>
                {article.tags.map((tag) => (
                  <Button data-id="article-tag" compact key={tag} size="mini">
                    {tag}
                  </Button>
                ))}
              </Item.Meta>
            )}
            <Item.Description>
              <MarkdownTextArea data-id="content" preview={preview}>
                {article.content || ""}
              </MarkdownTextArea>
              {preview && <p />}
              {preview && (
                <Link href={href}>
                  <a data-id="read-further-button" className="ui compact basic small button">
                    Read further
                  </a>
                </Link>
              )}
            </Item.Description>
            <Item.Extra>
              {/*<LazyIcon name="comment outline"/>*/}
              {/*{this.props.comments.length} comments | */}
              <span data-id="created-at" suppressHydrationWarning>
                Created {formatDateTime(article.created)}
              </span>
            </Item.Extra>
          </ContentPlaceholderOr>
        </Item.Content>
      </Item>
    </Segment>
  );
};
