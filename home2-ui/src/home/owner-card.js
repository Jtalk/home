import React from "react";
import {Card, Image} from "semantic-ui-react";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {ifMount, markUnmount} from "../utils/async";
import {loadOwner} from "../io/api";
import {imageUrl} from "../utils/image";

class OwnerCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            owner: {
                name: "",
                nickname: "",
                description: "",
                photoId: undefined,
                contacts: []
            },
            loading: true
        }
    }

    render() {
        return <Card>
            <ImagePlaceholderOr square loading={this._isLoading()}>
                {this.state.owner.photoId && <Image wrapped src={imageUrl(this.state.owner.photoId)}/>}
            </ImagePlaceholderOr>
            <Card.Content>
                <ContentPlaceholderOr header loading={this._isLoading()} lines={3}>
                    <Card.Header>{this.state.owner.name}</Card.Header>
                    <Card.Meta>{this.state.owner.nickname}</Card.Meta>
                    <Card.Description>{this.state.owner.description}</Card.Description>
                </ContentPlaceholderOr>
            </Card.Content>
            <Card.Content extra icon="user">
                <LinePlaceholderOr length="short" loading={this._isLoading()}>
                    {this._findEmail()}
                </LinePlaceholderOr>
            </Card.Content>
        </Card>
    }

    async componentDidMount() {
        let owner = await loadOwner();
        ifMount(this, () => this.setState({photoUrl: this.state.photoUrl, owner: owner, loading: false}));
    }

    componentWillUnmount = markUnmount.bind(this);

    _findEmail() {
        let found = this.state.owner.contacts.find(c => c.contactType === "EMAIL");
        return found && found.value;
    }

    _isLoading() {
        return this.state.loading;
    }
}

export default OwnerCard;