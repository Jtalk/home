import React from "react";
import BlogArticle from "./blog-article";
import {Grid, Menu, Segment} from "semantic-ui-react";
import OwnerCard from "../home/owner-card";
import LatestPosts from "../home/latest-posts";
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import BlogArticleLoader from "./blog-article-loader";
import WebError from "../error/web-error";

class Blog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            articles: [
                {
                    title: "Blog Entry 1",
                    href: "/blog/article/blog-entry-1",
                    tags: [{name: "Hello"}, {name: "Tags!"}],
                    content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                        " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                        " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                        " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                        " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                    comments: [],
                    createTime: new Date(2017, 11, 15, 12, 30)
                },
                {
                    title: "Blog Entry 2",
                    href: "/blog/article/blog-entry-2",
                    tags: [{name: "Hello"}, {name: "Other"}, {name: "Tags!"}],
                    content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                        " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                        " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                        " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                        " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                    comments: [],
                    createTime: new Date(2018, 5, 3, 11, 13)
                }
            ]
        };
    }

    render() {
        return <Grid centered stackable columns={2}>
            <Grid.Row>
                <Grid.Column width={11}>
                    {
                        this.blogRouting(() => this.state.articles.map(
                            article => <BlogArticle key={article.title} {...article} />),
                            articleId => <BlogArticleLoader articleId={articleId}/>)
                    }
                </Grid.Column>
                <Grid.Column width={3}>
                    <OwnerCard/>
                    <LatestPosts/>
                </Grid.Column>
            </Grid.Row>
            {this.blogRouting(
                () =>
                    <Grid.Row>
                        <Segment floated="right" basic compact>
                            <Menu pagination>
                                <Link to={"/Hello"} className="ui menu item">{1}</Link>
                            </Menu>
                        </Segment>
                    </Grid.Row>,
                () => null
            )}
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Blog";
    }

    blogRouting(indexRender, articleRender) {
        return <Router>
            <Switch>
                <Route exact path="/blog" render={() => indexRender()}/>
                <Route exact path="/blog/article/:articleId" render={param => {
                    console.log(param);
                    return articleRender(param.match.params.articleId);
                }}/>
                <Route render={() => <WebError httpCode={404} message="Not Found"/>}/>
            </Switch>
        </Router>
    }
}

export default Blog;