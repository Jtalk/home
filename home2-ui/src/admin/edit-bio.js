import React from "react";
import {Button, Divider, Form, Grid, Image, Input, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {loadOwner} from "../io/api";
import {ifMount} from "../utils/async";
import api from "../utils/superagent-api";
import * as request from "superagent";
import {imageUrl} from "../utils/image";
import {update} from "../utils/object";
import {Logger} from "../utils/logger";

export default class EditBio extends React.Component {

    constructor(props) {
        super(props);
        this.log = Logger.of(this.constructor.name);
        this.state = {
            owner: {
                name: "",
                photoId: "",
                nickname: "",
                description: "",
                email: "",
                bio: ""
            },
            executed: undefined,
            errorMessage: undefined,
            loading: true
        }
    }

    render() {
        let owner = this.state.owner;
        return <Grid centered>
            <Grid.Column width={11}>
                <Segment raised>
                    <h2>Edit bio</h2>
                    <Form onSubmit={this._onSubmit} loading={this.state.loading} error={this.state.errorMessage} success={this.state.executed && !this.state.errorMessage}>
                        <Divider/>
                        <Grid stackable>
                            <Grid.Row>
                                <Grid.Column width={11}>
                                    <Form.Input label="Owner Name" placeholder="Name" value={owner.name} name="name" onChange={this._onChange}/>
                                    <Form.Input label="Owner Nickname" placeholder="Nickname" value={owner.nickname} name="nickname" onChange={this._onChange}/>
                                    <Form.Input label="Owner E-Mail" placeholder="E-Mail" value={owner.email} name="email" onChange={this._onChange}/>
                                    <Form.Input label="Owner Short Bio" placeholder="Description" value={owner.description} name="description" onChange={this._onChange}/>
                                    <SuccessMessage message="Changes successfully saved"/>
                                    <ErrorMessage message={this.state.errorMessage}/>
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

    async componentDidMount() {
        let owner = await loadOwner();
        this._toFlatContacts(owner);
        ifMount(this, () => this.setState({photoUrl: this.state.photoUrl, owner: owner, loading: false}));
    }

    _onSubmit = async () => {
        try {
            let photoId = await this._uploadPhoto();
            let newOwner = update(this.state.owner, o => o.photoId = photoId);
            let response = await request.post("/owner", update(newOwner, this._toContactCollection))
                .use(api);
            this.log.info(`Owner updated with ${response.status}: ${response.text}`);
            let newState = update(this.state, s => {
                s.owner = newOwner;
                s.executed = true;
            });
            this.setState(newState);
        } catch (e) {
            this.log.error(`Exception while updating owner bio for ${JSON.stringify(this.state.owner)}`, e);
        }
    };

    _onChange = (e, { name, value }) => {
        let newState = Object.assign({}, this.state);
        newState.owner = Object.assign({}, newState.owner);
        newState.owner[name] = value;
        this.setState(newState)
    };

    _photoSelected = (e) => {
        let file = e.target.files[0];
        let newState = update(this.state, s => s.photoToUpload = file);
        this.setState(newState);
    };

    async _uploadPhoto() {
            let photo = this.state.photoToUpload;
            if (!photo) {
                return this.state.owner.photoId;
            }
        try {
            let response = await request.post("/images")
                .attach("img", photo)
                .use(api);

            let body = response.body;
            if (body.status !== "ok") {
                this.log.error(`Unexpected response from API upon photo upload: ${JSON.stringify(body)}`);
                throw Error("API error while uploading photo");
            }
            return body.id;
        } catch (e) {
            this.log.error("Exception while uploading a new photo", e);
            throw Error("Cannot upload a new photo")
        }
    }

    _toFlatContacts(owner) {
        let emailEntry = owner.contacts.find(c => c.contactType === "EMAIL");
        owner.contacts = undefined;
        if (emailEntry) {
            owner.email = emailEntry.value
        }
        return owner;
    }

    _toContactCollection(owner) {
        if (owner.email) {
            owner.contacts = [{contactType: "EMAIL", value: owner.email}];
        }
        owner.email = undefined;
        return owner;
    }
}