import React from "react";
import {EditBlogArticle} from "./edit-blog-article";
import {EditBlog} from "./edit-blog";
import {PartialRoute} from "../navigation/route";
import {useParams} from "react-router";
import {Titled} from "react-titled";

export const EditBlogRouter = function () {
    return <React.Fragment>
        <Titled title={t => "Edit Blog | " + t}/>
        <PartialRoute exact path="/">
            <EditBlog/>
        </PartialRoute>
        <PartialRoute path="/:articleId">
            <EditBlogParametrisedArticle/>
        </PartialRoute>
    </React.Fragment>
};

export const EditBlogParametrisedArticle = function () {
    let articleId = useParams().articleId;
    if (!articleId) {
        throw Error("Rendering an article with articleId=undefined within a strict articleId route");
    }
    return <EditBlogArticle articleId={articleId}/>
};