import React from "react";
import {Card, Image} from "semantic-ui-react";
import * as request from "superagent";
import {ContentPlaceholderOr, ImagePlaceholderOr, LinePlaceholderOr} from "../utils/placeholder";
import {apiDelay} from "../utils/test-api-delay";
import api from "../utils/superagent-api";
import {ifMount, markUnmount} from "../utils/async";

class OwnerCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photoUrl: "/images/avatar.png",
            owner: {
                name: "",
                nickname: "",
                description: "",
                contacts: []
            },
            loading: true
        }
    }

    render() {
        return <Card>
            <ImagePlaceholderOr square loading={this._isLoading()}>
                <Image wrapped src={this.state.photoUrl}/>
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
        let response = await request.get("/owner/info")
            .use(api);
        await apiDelay();
        ifMount(this, () => this.setState({photoUrl: this.state.photoUrl, owner: response.body, loading: false}));
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