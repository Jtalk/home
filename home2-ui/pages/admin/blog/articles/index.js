import React from "react";
import {Button, Grid, Icon, List, Segment} from "semantic-ui-react";
import {formatDateTime} from "../../../../utils/date-time";
import Link from "next/link";
import {AddBlogArticleModal} from "../../../../component/admin/add-blog-article-modal";
import {useArticles, useArticlesDeleter} from "../../../../data/reduce/articles";
import {editHref} from "./[articleId]";

const DEFAULT_PAGE_SIZE = 100;

export default function EditBlog() {
    let articles = useArticles(0, DEFAULT_PAGE_SIZE, true); // TODO: Add pagination to blog editor
    let onDelete = useArticlesDeleter();

    return <EditBlogStateless page={1} {...{articles, onDelete}}/>
};

export const EditBlogStateless = function ({articles, page, onDelete}) {

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <h2>Edit blog</h2>
                <AddBlogArticleModal/>
                <br/>
                <br/>
                <List animated celled verticalAlign="middle">
                    {articles.map(article => <EditBlogItem key={article.id} article={article}
                                                           onDelete={() => onDelete(article.id, {page})}/>)}
                </List>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditBlogItem = function ({article, onDelete}) {
    return <List.Item>
        <List.Content floated="right">
            <Link href={editHref(article.id)}>
                <a className="ui button">Edit</a>
            </Link>
            <Button size="small" color="red" onClick={onDelete}>Delete</Button>
        </List.Content>
        <List.Content>
            <List.Header as="h3">
                <Link href={href(article.id)}>
                    <a>{article.title}</a>
                </Link>
            </List.Header>
            <List.Description>
                Created {formatDateTime(article.created)}
                &nbsp;|&nbsp;
                {article.published ? <Icon name="check" color="green"/> : <Icon name="remove" color="red"/>}
                &nbsp;
                {article.published ? "Published" : "Not published"}
            </List.Description>
        </List.Content>
    </List.Item>
};

function href(articleId) {
    return `/blog/articles/${articleId}`;
}