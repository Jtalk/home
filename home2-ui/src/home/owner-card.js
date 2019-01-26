import React from "react";
import {Card, Image} from "semantic-ui-react";

class OwnerCard extends React.Component {

    render() {
        return <Card>
            <Image wrapped src={this.props.ownerPhotoUrl}/>
            <Card.Content>
                <Card.Header>{this.props.ownerName}</Card.Header>
                <Card.Meta>{this.props.ownerNickname}</Card.Meta>
                <Card.Description>{this.props.ownerDescription}</Card.Description>
            </Card.Content>
            <Card.Content extra icon="user">{this.props.ownerEmail}</Card.Content>
        </Card>
    }
}

export default OwnerCard;