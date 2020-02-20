import React from "react";
import {Card, Image} from "semantic-ui-react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {imageUrl} from "../utils/image";
import {connect} from "react-redux";
import {Loading} from "../data/reduce/global/enums";
import _ from "lodash";
import {useImmutableSelector} from "../utils/redux-store";
import {useAjaxLoader} from "../context/ajax-context";
import {load} from "../data/reduce/owner";

export const OwnerCard = function () {

    useAjaxLoader(load);

    let owner = useImmutableSelector("owner", "data");
    let loading = useImmutableSelector("owner", "loading");

    return <Card>
        <ImagePlaceholderOr square loading={loading === Loading.LOADING}>
            {owner.photoId && <Image wrapped src={imageUrl(owner.photoId)}/>}
        </ImagePlaceholderOr>
        <Card.Content>
            <ContentPlaceholderOr header loading={loading === Loading.LOADING} lines={3}>
                <Card.Header>{owner.name}</Card.Header>
                <Card.Meta>{owner.nickname}</Card.Meta>
                <Card.Description>{owner.description}</Card.Description>
            </ContentPlaceholderOr>
        </Card.Content>
        <Card.Content extra icon="user">
            <LinePlaceholderOr length="short" loading={loading === Loading.LOADING}>
                {_.get(owner, "contacts.email.value", null)}
            </LinePlaceholderOr>
        </Card.Content>
    </Card>
};