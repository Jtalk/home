import React from "react";
import "../bbcode/tags";
import {Link} from "react-router-dom";
import {Button, Divider, Icon, Item, Segment} from "semantic-ui-react";
import {formatMarkup} from "../utils/text-markup";
import {formatDateTime} from "../utils/date-time";

class BlogArticle extends React.Component {

    render() {
        return <Segment className="items">
            <Item>
                <Item.Content>
                    <Item.Header>
                        <Link to={this.props.href}>
                            <h1>{this.props.title}</h1>
                        </Link>
                    </Item.Header>
                    <Divider/>
                    <Item.Meta>
                        <Button.Group size="mini" compact>
                            {this.props.tags.map(tag => <Button key={tag.name}>{tag.name}</Button>)}
                        </Button.Group>
                    </Item.Meta>
                    <Item.Description>
                        {formatMarkup(this.props.content)}
                        <Link to={this.props.href} className="ui button">
                            Read further
                        </Link>
                    </Item.Description>
                    <Item.Extra>
                        <Icon name="comment outline"/>
                        {this.props.comments.length} comments | Created {formatDateTime(this.props.createTime)}
                    </Item.Extra>
                </Item.Content>
            </Item>
        </Segment>
    }
}

export default BlogArticle;