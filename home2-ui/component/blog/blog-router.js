import {PartialRoute} from "../../navigation/route";
import {useParams} from "react-router-dom";
import {BlogArticle} from "./blog-article";
import {Blog} from "./blog";
import {useActiveRoute} from "../../navigation/active-route-context";
import React from "react";

export const BlogRouter = function () {
    return <React.Fragment>
        <PartialRoute exact path="/">
            <Blog/>
        </PartialRoute>
        <PartialRoute path="/:articleId">
            <BlogArticleParametrised/>
        </PartialRoute>
    </React.Fragment>
};

export const BlogArticleParametrised = function() {

    let articleId = useParams().articleId;
    let path = useActiveRoute(articleId);

    return <BlogArticle id={articleId} href={path}/>
};
