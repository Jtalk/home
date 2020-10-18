import React from "react";
import {Grid} from "semantic-ui-react";
import {OwnerCard} from "../component/about/owner-card";
import {LatestPosts} from "../component/about/latest-posts";
import {ContentPlaceholderOr} from "../component/placeholder";
import {Loading} from "../data/reduce/global/enums";
import {ownerActions, useOwner, useOwnerLoading} from "../data/reduce/owner";
import {MarkdownTextArea} from "../component/text-area";
import {reduxWrapper} from "../data/redux";
import {footerActions} from "../data/reduce/footer";
import {latestArticlesActions} from "../data/reduce/latest-articles";
import {OwnerTitled} from "../component/about/owner-titled";

export default function About() {

    const {bio} = useOwner();
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

export const getServerSideProps = reduxWrapper.getServerSideProps(async ({store}) => {
    await Promise.all([
        store.dispatch(ownerActions.load()),
        store.dispatch(latestArticlesActions.load()),
        store.dispatch(footerActions.load()),
    ])
    return {props: {}}
})
