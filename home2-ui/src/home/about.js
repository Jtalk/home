import React from "react";
import {Grid} from "semantic-ui-react";
import {OwnerCard} from "./owner-card";
import {LatestPosts} from "./latest-posts";
import "../bbcode/tags";
import {formatMarkup} from "../utils/text-markup";
import {ContentPlaceholderOr} from "../utils/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjaxLoader} from "../context/ajax-context";
import {load} from "../data/reduce/owner";

export const About = function () {

    useAjaxLoader(load);

    let bio = useImmutableSelector("owner", "data", "bio");
    let loading = useImmutableSelector("owner", "loading");

    return <Grid stackable centered>
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