import React from "react";
import {Grid} from "semantic-ui-react";
import {OwnerCard} from "./owner-card";
import {LatestPosts} from "./latest-posts";
import "../bbcode/tags";
import {formatMarkup} from "../utils/text-markup";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {useOwner, useOwnerLoading} from "../data/reduce/owner";
import {Titled} from "react-titled";

export const About = function () {

    let {bio} = useOwner();
    let loading = useOwnerLoading();

    return <Grid stackable centered>
        <Titled title={t => "About | " + t}/>
        <Grid.Row>
            <Grid.Column width={10} as="main">
                <ContentPlaceholderOr header lines={30} loading={loading === Loading.LOADING}>
                    {formatMarkup(bio)}
                </ContentPlaceholderOr>
            </Grid.Column>
            <Grid.Column width={4}>
                <OwnerCard/>
                <LatestPosts/>
            </Grid.Column>
        </Grid.Row>
    </Grid>
};