import React from "react";
import {Route, Switch} from "react-router";
import {EditBio} from "./edit-bio";
import EditBlog from "./edit-blog";
import EditBlogArticle from "./edit-blog-article";
import EditProjects from "./edit-projects";
import {EditImages} from "./edit-images";
import EditFooter from "./edit-footer";

export default class AdminRouter extends React.Component {

    render() {
        return <Switch>
            <Route exact path="/admin/bio"
                   render={() => <EditBio ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/projects"
                   component={() => <EditProjects ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/projects/:projectId"
                   component={params => <EditProjects currentProjectId={params.match.params.projectId} ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/blog"
                   render={() => <EditBlog ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/blog/article/:id"
                   render={params => <EditBlogArticle articleId={params.match.params.articleId} ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/images"
                   render={() => <EditImages currentPageIdx={0} ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/images/:idx"
                   render={params => <EditImages currentPageIdx={params.match.params.idx} ownerName={this.props.ownerName}/>}/>
            <Route exact path="/admin/footer"
                   render={params => <EditFooter ownerName={this.props.ownerName}/>}/>
        </Switch>
    }
}