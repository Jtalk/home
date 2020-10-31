import React from "react";
import {OwnerCard} from "../component/about/owner-card";
import {LatestPosts} from "../component/about/latest-posts";
import {Loading} from "../data/reduce/global/enums";
import {ownerActions, useOwner, useOwnerLoading} from "../data/reduce/owner";
import {MarkdownTextArea} from "../component/text-area";
import {reduxWrapper} from "../data/redux";
import {OwnerTitled} from "../component/about/owner-titled";
import {ContentPlaceholderOr} from "../component/placeholder/content-placeholder";
import {footerActions} from "../data/reduce/footer/actions";
import {latestArticlesActions} from "../data/reduce/latest-articles/actions";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import {useReducers} from "../data/redux-dynamic";
import ownerReducer from "../data/reduce/owner"
import latestArticlesReducer from "../data/reduce/latest-articles"
import searchReducer from "../data/reduce/search"
import footerReducer from "../data/reduce/footer"
import authenticationReducer from "../data/reduce/authentication"

export default function About() {

    useReducers(ownerReducer, latestArticlesReducer, authenticationReducer, searchReducer, footerReducer);
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
