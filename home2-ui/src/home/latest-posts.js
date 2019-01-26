import React from "react";
import {Card, Divider, List} from "semantic-ui-react";

class LatestPosts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            posts: [
                {url: "/post3", title: "Test Post 3", createTime: new Date(2018, 11, 5)},
                {url: "/post2", title: "Test Post 2", createTime: new Date(2018, 11, 2, 11, 45,12)},
                {url: "/post1", title: "Test Post 1", createTime: new Date(2017, 12, 2)},
            ]
        }
    }


    render() {
        let latestPostElements = this.state.posts.map(post =>
            LatestPosts.createPostItem(post)
        );
        return <Card>
            <Card.Content>
                <Card.Header>Latest Posts</Card.Header>
                <Card.Description>
                    <Divider/>
                    <List>
                        {latestPostElements}
                    </List>
                </Card.Description>
            </Card.Content>
        </Card>
    }

    static createPostItem(post) {
        return <List.Item key={post.title}>
            <List.Content>
                <List.Header as="h4">
                    {/*TODO: React link*/}
                    <a href={post.url}>{post.title}</a>
                </List.Header>
                <List.Description>
                    {post.createTime.toLocaleString()}
                </List.Description>
            </List.Content>
        </List.Item>
    }
}

export default LatestPosts;