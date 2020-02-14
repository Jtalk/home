import React from "react";
import {Button, Grid, Icon, List, Segment} from "semantic-ui-react";
import {formatDateTime} from "../utils/date-time";
import {Link} from "react-router-dom";
import AddBlogArticleModal from "./add-blog-article-modal";
import {useAjax, useLoader} from "../context/ajax-context";
import {loadPage as articlesLoader, remove} from "../data/reduce/articles";
import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../utils/redux-store";

// eslint-disable-next-line
let tempObj = {
    articles: [
        {
            id: "blog-entry-1",
            title: "Blog Entry 1",
            href: "/blog/articles/blog-entry-1",
            editHref: "/admin/blog/articles/blog-entry-1",
            tags: [{name: "Hello"}, {name: "Tags!"}],
            content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
            comments: [],
            published: true,
            createTime: new Date(2017, 11, 15, 12, 30)
        },
        {
            id: "blog-entry-2",
            title: "Blog Entry 2",
            href: "/blog/articles/blog-entry-2",
            editHref: "/admin/blog/articles/blog-entry-2",
            tags: [{name: "Hello"}, {name: "Other"}, {name: "Tags!"}],
            content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
            comments: [],
            published: false,
            createTime: new Date(2018, 5, 3, 11, 13)
        }
    ]
};

const DEFAULT_PAGE_SIZE = 100;

export const EditBlog = function ({page = 0, pageSize = DEFAULT_PAGE_SIZE}) {

    let ajax = useAjax();

    useLoader(articlesLoader, ajax, page, pageSize);

    let dispatch = useDispatch();
    let articles = useImmutableSelector("articles", ["data", "articles"]);
    let pagination = useImmutableSelector("articles", ["data", "pagination"]);

    let onDelete = (id) => {
        return () => {
            dispatch(remove(ajax, id, page, pageSize));
        }
    };

    return <EditBlogStateless {...{articles, pagination, onDelete}}/>
};

export const EditBlogStateless = function ({articles, pagination, onDelete}) {

    void pagination;

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <h2>Edit blog</h2>
                <AddBlogArticleModal/>
                <br/>
                <br/>
                <List animated celled verticalAlign="middle">
                    {articles.map(article => <EditBlogItem key={article.id} article={article}
                                                           onDelete={onDelete(article.id)}/>)}
                </List>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditBlogItem = function ({article, onDelete}) {
    return <List.Item>
        <List.Content floated="right">
            <Link className="ui button" to={editHref(article.id)}>Edit</Link>
            <Button size="small" color="red" onClick={onDelete}>Delete</Button>
        </List.Content>
        <List.Content>
            <List.Header as="h3">
                <Link to={href(article.id)}>{article.title}</Link>
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

function editHref(articleId) {
    return `/admin/blog/${articleId}`;
}

function href(articleId) {
    return `/blog/${articleId}`;
}