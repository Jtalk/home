import React from "react";
import {Grid} from "semantic-ui-react";
import {OwnerCard} from "./owner-card";
import {LatestPosts} from "./latest-posts";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {useOwner, useOwnerLoading} from "../data/reduce/owner";
import {Titled} from "react-titled";
import {MarkdownTextArea} from "../shared/text-area";

export const About = function () {

    let {bio} = useOwner();
    let loading = useOwnerLoading();

    return <Grid stackable centered>
        <Titled title={t => "About | " + t}/>
        <Grid.Row>
            <Grid.Column width={10} as="main">
                <ContentPlaceholderOr header lines={30} loading={loading === Loading.LOADING}>
                    <MarkdownTextArea>{bio}</MarkdownTextArea>
                </ContentPlaceholderOr>
            </Grid.Column>
            <Grid.Column width={4}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
    </Grid>
};