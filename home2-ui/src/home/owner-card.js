import React from "react";
import {Card, Image} from "semantic-ui-react";
import * as request from "superagent";
import * as prefix from "superagent-prefix"

class OwnerCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photoUrl: "/images/avatar.png",
            owner: {
                name: "Vasya Pupkin",
                nickname: "VPupkin",
                description: "Very cool guy",
                contacts: [
                    { contactType: "EMAIL", value: "test@example.com" },
                    { contactType: "SKYPE", value: "som-words" },
                ]
            }
        }
    }

    render() {
        return <Card>
            <Image wrapped src={this.state.photoUrl}/>
            <Card.Content>
                <Card.Header>{this.state.owner.name}</Card.Header>
                <Card.Meta>{this.state.owner.nickname}</Card.Meta>
                <Card.Description>{this.state.owner.description}</Card.Description>
            </Card.Content>
            <Card.Content extra icon="user">{this._findEmail()}</Card.Content>
        </Card>
    }

    async componentDidMount() {
        let response = await request.get("/owner/info")
            .use(prefix("http://localhost:8090"));
        this.setState({photoUrl: this.state.photoUrl, owner: response.body});
    }

    _findEmail() {
        let found = this.state.owner.contacts.find(c => c.contactType === "EMAIL");
        return found && found.value;
    }
}

export default OwnerCard;