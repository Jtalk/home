import React, {useCallback, useState} from "react";
import {Card} from "semantic-ui-react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../placeholder";
import {Loading} from "../../data/reduce/global/enums";
import {useOwner, useOwnerLoading} from "../../data/reduce/owner";
import {LoginModal} from "../login/login";
import {useLoggedIn} from "../../data/reduce/authentication";
import {OptionalImage} from "../image";
import get from "lodash/get";

export const OwnerCard = function () {

    let owner = useOwner();
    let loading = useOwnerLoading();
    let loggedIn = useLoggedIn();

    let [loggingIn, setLoggingIn] = useState(false);

    const showLogin = useCallback(() => {
        loggedIn || setLoggingIn(true);
    }, [loggedIn]);
    const onCloseHandler = useCallback(() => setLoggingIn(false), []);

    return <>
        <CardStateless {...{loading, owner, showLogin}} />
        <LoginModal enabled={loggingIn} onClose={onCloseHandler}/>
    </>
};

export const CardStateless = function({loading, owner, showLogin}) {
    let onNameClick = e => {
        if (e.altKey) {
            showLogin(e);
        }
    };
    return <Card>
        <ImagePlaceholderOr square loading={loading === Loading.LOADING}>
            <OptionalImage wrapped id={owner.photoId}/>
        </ImagePlaceholderOr>
        <Card.Content>
            <ContentPlaceholderOr header loading={loading === Loading.LOADING} lines={3}>
                <Card.Header onClick={onNameClick}>{owner.name}</Card.Header>
                <Card.Meta>{owner.nickname}</Card.Meta>
                <Card.Description>{owner.description}</Card.Description>
            </ContentPlaceholderOr>
        </Card.Content>
        <Card.Content extra icon="user">
            <LinePlaceholderOr length="short" loading={loading === Loading.LOADING}>
                {get(owner, "contacts.email.value", null)}
            </LinePlaceholderOr>
        </Card.Content>
    </Card>;
};
