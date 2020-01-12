import React from "react";
import {Grid} from "semantic-ui-react";
import OwnerCard from "./owner-card";
import LatestPosts from "./latest-posts";
import "../bbcode/tags";
import {formatMarkup} from "../utils/text-markup";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {connect} from "react-redux";
import {Loading} from "../data/reduce/global/enums";


class About extends React.Component {

    render() {
        return <Grid stackable centered>
            <Grid.Row>
                <Grid.Column width={10} as="main">
                    <ContentPlaceholderOr header lines={30} loading={this.props.loading === Loading.LOADING}>
                        {formatMarkup(this.props.text)}
                    </ContentPlaceholderOr>
                </Grid.Column>
                <Grid.Column width={4}>
                    <OwnerCard/>
                    <LatestPosts/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }
}

function mapToProps(state) {
    return {
        text: state.owner.getIn(["data", "bio"]),
        loading: state.owner.get("loading")
    }
}

export default connect(mapToProps, null)(About);