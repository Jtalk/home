import React from "react";
import {Card, Image} from "semantic-ui-react";
import {useState} from "react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {imageUrl} from "../utils/image";
import {Loading} from "../data/reduce/global/enums";
import _ from "lodash";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjaxLoader} from "../context/ajax-context";
import {load} from "../data/reduce/owner";
import {LoginModal} from "../login/login";

export const OwnerCard = function () {

    useAjaxLoader(load);

    let owner = useImmutableSelector("owner", "data");
    let loading = useImmutableSelector("owner", "loading");
    let loggedIn = useImmutableSelector("authentication", "loggedIn");

    let [loggingIn, setLoggingIn] = useState(false);

    let showLogin = e => {
        loggedIn || setLoggingIn(true);
    };

    return <React.Fragment>
        <CardStateless {...{loading, owner, showLogin}} />
        <LoginModal enabled={loggingIn} onClose={() => setLoggingIn(false)}/>
    </React.Fragment>
};

export const CardStateless = function({loading, owner, showLogin}) {
    let onNameClick = e => {
        if (e.altKey) {
            showLogin(e);
        }
    };
    return <Card>
        <ImagePlaceholderOr square loading={loading === Loading.LOADING}>
            {owner.photoId && <Image wrapped src={imageUrl(owner.photoId)}/>}
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
                {_.get(owner, "contacts.email.value", null)}
            </LinePlaceholderOr>
        </Card.Content>
    </Card>;
};
