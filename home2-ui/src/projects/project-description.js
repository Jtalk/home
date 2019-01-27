import React from "react";
import "../bbcode/tags";
import {Grid, Image, Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {formatMarkup} from "../utils/text-markup";

export default class ProjectDescription extends React.Component {

    render() {
        return <Grid stackable centered layout="block">
            <Grid.Column width={3}>
                <Image size="small" src={this.props.logo} alt={this.props.title + " Logo"}/>
                <Menu fluid vertical text layout="block">
                    <div className="active item">Overview</div>
                    {this.props.links.map(link => <Link to={link.href}>link.name</Link>)}
                </Menu>
            </Grid.Column>
            <Grid.Column width={12}>
                {formatMarkup(this.props.description)}
            </Grid.Column>
        </Grid>
    }
}