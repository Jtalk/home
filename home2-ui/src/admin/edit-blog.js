import React from "react";
import {Button, Grid, Icon, List, Segment} from "semantic-ui-react";
import {formatDateTime} from "../utils/date-time";
import {Link} from "react-router-dom";
import AddBlogArticleModal from "./add-blog-article-modal";

export default class EditBlog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            articles: [
                {
                    id: "blog-entry-1",
                    title: "Blog Entry 1",
                    href: "/blog/article/blog-entry-1",
                    editHref: "/admin/blog/article/blog-entry-1",
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
                    href: "/blog/article/blog-entry-2",
                    editHref: "/admin/blog/article/blog-entry-2",
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
        }
    }

    render() {
        return <Grid centered>
            <Grid.Column width={13}>
                <Segment raised>
                    <h2>Edit blog</h2>
                    <AddBlogArticleModal/>
                    <br/>
                    <br/>
                    <List animated celled verticalAlign="middle">
                        {this.state.articles.map(article =>
                            <List.Item key={article.id}>
                                <List.Content floated="right">
                                    <Link className="ui button" to={article.editHref}>Edit</Link>
                                    <Button size="small" color="red" onClick={this._confirmAndDelete}>Delete</Button>
                                </List.Content>
                                <List.Content>
                                    <List.Header as="h3">
                                        <Link to={article.href}>{article.title}</Link>
                                    </List.Header>
                                    <List.Description>
                                        Created {formatDateTime(article.createTime)}
                                        &nbsp;|&nbsp;
                                        {article.published ? <Icon name="check" color="green"/> : <Icon name="remove" color="red"/>}
                                        &nbsp;
                                        {article.published ? "Published" : "Not published"}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        )}
                    </List>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Blog";
    }

    _onChange(event) {

    }

    _confirmAndDelete(event) {

    }
}