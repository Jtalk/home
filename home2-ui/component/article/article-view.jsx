import isEmpty from "lodash/isEmpty";
import {Loading} from "../../data/reduce/global/enums";
import {ContentPlaceholderOr} from "../placeholder/content-placeholder";
import Link from "next/link";
import {MarkdownTextArea} from "../text-area";
import {formatDateTime} from "../../utils/date-time";
import React from "react";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Item from "semantic-ui-react/dist/commonjs/views/Item";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";

export const ArticleView = function ({article, loading, href, preview}) {

    const articleLoading = isEmpty(article) && loading !== Loading.READY;

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
