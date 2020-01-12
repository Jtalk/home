import React from "react";
import {Card, Image} from "semantic-ui-react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {imageUrl} from "../utils/image";
import {connect} from "react-redux";
import {Loading} from "../data/reduce/global/enums";
import _ from "lodash";

class OwnerCard extends React.Component {

    render() {
        return <Card>
            <ImagePlaceholderOr square loading={this.props.loading === Loading.LOADING}>
                {this.props.owner.photoId && <Image wrapped src={imageUrl(this.props.owner.photoId)}/>}
            </ImagePlaceholderOr>
            <Card.Content>
                <ContentPlaceholderOr header loading={this.props.loading === Loading.LOADING} lines={3}>
                    <Card.Header>{this.props.owner.name}</Card.Header>
                    <Card.Meta>{this.props.owner.nickname}</Card.Meta>
                    <Card.Description>{this.props.owner.description}</Card.Description>
                </ContentPlaceholderOr>
            </Card.Content>
            <Card.Content extra icon="user">
                <LinePlaceholderOr length="short" loading={this.props.loading === Loading.LOADING}>
                    {_.get(this.props.owner, "contacts.email.value", null)}
                </LinePlaceholderOr>
            </Card.Content>
        </Card>
    }
}

function mapToProps(state) {
    let data = state.owner.toJS();
    return {
        loading: data.loading,
        owner: data.data
    };
}

export default connect(mapToProps, null)(OwnerCard);