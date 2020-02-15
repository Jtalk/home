import React from "react";
import {EditBlogArticle} from "./edit-blog-article";
import {EditBlog} from "./edit-blog";

export const EditBlogRouter = function({articleId}) {
    if (!articleId) {
        return <EditBlog/>
    } else {
        return <EditBlogArticle articleId={articleId}/>
    }
};