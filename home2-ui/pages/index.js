import React from "react";
import {OwnerCard} from "../component/about/owner-card";
import {LatestPosts} from "../component/about/latest-posts";
import {Loading} from "../data/hooks/global/enums";
import {useOwner, useOwnerLoading} from "../data/hooks/owner";
import {MarkdownTextArea} from "../component/text-area";
import {OwnerTitled} from "../component/about/owner-titled";
import {ContentPlaceholderOr} from "../component/placeholder/content-placeholder";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";

export default function About() {

    const {bio} = useOwner() || {};
    const loading = useOwnerLoading();

    return <Grid stackable centered>
        <OwnerTitled title={"About"}/>
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
