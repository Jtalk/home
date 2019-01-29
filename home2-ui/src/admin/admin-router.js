import React from "react";
import {Route, Switch} from "react-router";
import EditBio from "./edit-bio";
import EditBlog from "./edit-blog";
import EditBlogArticle from "./edit-blog-article";

export default class AdminRouter extends React.Component {

    render() {
        return <Switch>
            <Route exact path="/admin/bio"
                   render={() => <EditBio ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/blog"
                   render={() => <EditBlog ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/blog/article/:id"
                   render={params => <EditBlogArticle articleId={params.match.params.articleId} ownerName={this.props.ownerName}/>}/>
        </Switch>
    }
}