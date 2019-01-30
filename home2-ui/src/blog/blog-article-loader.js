import React from "react";
import "../bbcode/tags";
import BlogArticle from "./blog-article";

class BlogArticleLoader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            article: {
                title: "Blog Entry 1",
                href: "/blog/articles/blog-entry-1",
                tags: [{name: "Hello"}, {name: "Tags!"}],
                content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                    " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                    " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                    " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                    " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam" +
                    " est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius" +
                    " modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima" +
                    " veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea" +
                    " commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil" +
                    " molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?[/p]",
                comments: [],
                createTime: new Date(2017, 11, 15, 12, 30)
            },
        }
    }


    render() {
        return <BlogArticle {...this.state.article}/>
    }
}

export default BlogArticleLoader;