import React from "react";
import {Grid} from "semantic-ui-react";
import OwnerCard from "./owner-card";
import LatestPosts from "./latest-posts";
import "../bbcode/tags";
import {formatMarkup} from "../utils/text-markup";
import * as request from "superagent";
import {ContentPlaceholderOr} from "../utils/placeholder";
import api from "../utils/superagent-api";
import {apiDelay} from "../utils/test-api-delay";
import {Titled} from "react-titled";


export default class About extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            text: "",
            loading: true
        };
    }

    render() {
        return <Grid stackable centered>
            <Grid.Row>
                <Grid.Column width={10} as="main">
                    <ContentPlaceholderOr header lines={30} loading={this.state.loading}>
                        {formatMarkup(this.state.text)}
                    </ContentPlaceholderOr>
                </Grid.Column>
                <Grid.Column width={4}>
                    <OwnerCard/>
                    <LatestPosts/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }

    async componentDidMount() {
        let response = await request.get("/owner/bio")
            .use(api);
        await apiDelay();
        this.setState({text: response.text, loading: false})
    }
}