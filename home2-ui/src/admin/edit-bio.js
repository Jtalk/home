import React from "react";
import {Button, Divider, Form, Grid, Image, Input, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {imageUrl} from "../utils/image";
import {Logger} from "../utils/logger";
import {connect} from "react-redux";
import {fromJS} from "immutable";
import * as owner from "../data/reduce/owner";

class EditBio extends React.Component {

    constructor(props) {
        super(props);
        this.log = Logger.of(this.constructor.name);
        this.state = {
            data: {
                name: "",
                photoId: "",
                nickname: "",
                description: "",
                email: "",
                bio: ""
            },
            edited: false
        }
    }

    render() {
        let owner = this.state.data;
        return <Grid centered>
            <Grid.Column width={11}>
                <Segment raised>
                    <h2>Edit bio</h2>
                    <Form onSubmit={this._onSubmit} loading={this.props.loading} error={!!this.props.errorMessage} success={this.props.updated && !this.props.errorMessage}>
                        <Divider/>
                        <Grid stackable>
                            <Grid.Row>
                                <Grid.Column width={11}>
                                    <Form.Input label="Owner Name" placeholder="Name" value={owner.name} name="name" onChange={this._onChange}/>
                                    <Form.Input label="Owner Nickname" placeholder="Nickname" value={owner.nickname} name="nickname" onChange={this._onChange}/>
                                    <Form.Input label="Owner E-Mail" placeholder="E-Mail" value={owner.email} name="email" onChange={this._onChange}/>
                                    <Form.Input label="Owner Short Bio" placeholder="Description" value={owner.description} name="description" onChange={this._onChange}/>
                                    <SuccessMessage message="Changes successfully saved"/>
                                    <ErrorMessage message={this.props.errorMessage}/>
                                </Grid.Column>
                                <Grid.Column width={5}>
                                    <Form.Field>
                                        <label>Photo</label>
                                        <div className="image">
                                            { owner.photoId && <Image src={imageUrl(owner.photoId)} alt="Owner photo"/>}
                                        </div>
                                        <Input type="file" accept="image/*" onChange={this._photoSelected}/>
                                    </Form.Field>
                                    <Button primary type="submit">Save</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <TextArea autoHeight label="Bio" placeholder="Something about me..." value={owner.bio} name="bio" onChange={this._onChange}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    static getDerivedStateFromProps(newProps, oldState) {
        let newState = Object.assign({}, oldState);
        if (!oldState.edited) {
            newState = Object.assign(newState, { data: newProps.data });
        }
        return newState;
    }

    _onSubmit = () => {
        let owner = fromJS(this.state.data);
        owner = this._toContactCollection(owner);
        this.props.update(owner, this.state.photoToUpload);
        this.setState(Object.assign({}, this.state, { edited: false }))
    };

    _onChange = (e, { name, value }) => {
        this.log.debug(`Changing ${name} to ${value} in ${JSON.stringify(this.state.data)}`);
        let newState = Object.assign({}, this.state);
        newState.data = Object.assign({}, newState.data);
        newState.data[name] = value;
        newState.edited = true;
        this.setState(newState)
    };

    _photoSelected = (e) => {
        let file = e.target.files[0];
        let newState = Object.assign({}, this.state, { photoToUpload: file });
        this.setState(newState);
    };

    _toContactCollection(owner) {
        let email = owner.get("email");
        if (email) {
            owner = owner.set("contacts", fromJS([{contactType: "EMAIL", value: email}]));
        }
        return owner.remove("email");
    }
}

function mapToProps(state) {
    let owner = state.owner.toJS();
    toFlatContacts(owner.data);
    return owner;
}

function update(update, photo) {
    return owner.update(update, photo)
}

function toFlatContacts(owner) {
    let emailEntry = owner.contacts.find(c => c.contactType === "EMAIL");
    owner.contacts = undefined;
    if (emailEntry) {
        owner.email = emailEntry.value
    } else {
        owner.email = ""
    }
    return owner;
}

export default connect(mapToProps, { update })(EditBio);