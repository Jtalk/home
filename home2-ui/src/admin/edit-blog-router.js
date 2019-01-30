import React from "react";
import EditBlogArticle from "./edit-blog-article";
import EditBlog from "./edit-blog";

export default class EditBlogRouter extends React.Component {

    render() {
        if (!this.props.articleId) {
            return <EditBlog/>
        } else {
            return <EditBlogArticle articleId={this.props.articleId}/>
        }
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Blog";
    }
}