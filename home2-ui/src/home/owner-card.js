import React from "react";
import {Card, Image} from "semantic-ui-react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {imageUrl} from "../utils/image";
import {connect} from "react-redux";

class OwnerCard extends React.Component {

    render() {
        return <Card>
            <ImagePlaceholderOr square loading={this.props.loading}>
                {this.props.owner.photoId && <Image wrapped src={imageUrl(this.props.owner.photoId)}/>}
            </ImagePlaceholderOr>
            <Card.Content>
                <ContentPlaceholderOr header loading={this.props.loading} lines={3}>
                    <Card.Header>{this.props.owner.name}</Card.Header>
                    <Card.Meta>{this.props.owner.nickname}</Card.Meta>
                    <Card.Description>{this.props.owner.description}</Card.Description>
                </ContentPlaceholderOr>
            </Card.Content>
            <Card.Content extra icon="user">
                <LinePlaceholderOr length="short" loading={this.props.loading}>
                    {this._findEmail()}
                </LinePlaceholderOr>
            </Card.Content>
        </Card>
    }

    _findEmail() {
        let found = this.props.owner.contacts.find(c => c.contactType === "EMAIL");
        return found && found.value;
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