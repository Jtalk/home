import React from "react";
import {Card, Image} from "semantic-ui-react";

class OwnerCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            owner: {
                photoUrl: "/images/avatar.png",
                name: "Vasya Pupkin",
                nickname: "VPupkin",
                description: "Very cool guy",
                email: "vasya@example.com",
            }
        }
    }


    render() {
        return <Card>
            <Image wrapped src={this.state.owner.photoUrl}/>
            <Card.Content>
                <Card.Header>{this.state.owner.name}</Card.Header>
                <Card.Meta>{this.state.owner.nickname}</Card.Meta>
                <Card.Description>{this.state.owner.description}</Card.Description>
            </Card.Content>
            <Card.Content extra icon="user">{this.state.owner.email}</Card.Content>
        </Card>
    }
}

export default OwnerCard;