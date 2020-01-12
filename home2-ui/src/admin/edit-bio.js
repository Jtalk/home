import React, {useState} from "react";
import {Button, Divider, Form, Grid, Image, Input, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {imageUrl} from "../utils/image";
import {useDispatch} from "react-redux";
import {update as updateOwner} from "../data/reduce/owner";
import {useAjax} from "../context/ajax-context";
import {useImmutableSelector} from "../utils/redux-store";
import {Loading, Updating} from "../data/reduce/global/enums";
import _ from "lodash";

export const EditBio = function () {
    let ajax = useAjax();
    let dispatch = useDispatch();
    let owner = useImmutableSelector("owner", ["data"]);
    let loadingStatus = useImmutableSelector("owner", ["loading"]);
    let updateStatus = useImmutableSelector("owner", ["updating"]);
    let errorMessage = useImmutableSelector("owner", ["errorMessage"]);

    let onUpdate = (owner, newPhoto) => {
        dispatch(updateOwner(ajax, owner, newPhoto));
    };

    return <EditBioStateless existingOwner={owner} doUpdate={onUpdate} {...{loadingStatus, updateStatus, errorMessage}}/>
};

export const EditBioStateless = function ({existingOwner, loadingStatus, updateStatus, errorMessage, doUpdate}) {
    let [owner, setOwner] = useState(existingOwner);
    let [edited, setEdited] = useState(false);
    let [photoToUpload, setPhotoToUpload] = useState(null);
    let [updating, setUpdating] = useState(false);

    let hasError = loadingStatus === Loading.ERROR || updateStatus === Updating.ERROR;
    let reportSuccess = updateStatus === Updating.UPDATED;
    let operationIsInProgress = loadingStatus === Loading.LOADING || updateStatus === Updating.UPDATING;

    if ([Updating.UPDATED, Updating.ERROR].includes(updateStatus) && updating) {
        setUpdating(false);
        if (updateStatus === Updating.UPDATED) {
            setEdited(false);
            setPhotoToUpload(null);
            setOwner(existingOwner);
        }
    } else if (!edited && !_.isEqual(owner, existingOwner)) {
        setOwner(existingOwner);
    }

    let onSubmit = (e) => {
        if (!edited) {
            console.error(`No changes to submit: edited=${edited}, photo=${photoToUpload}`, owner, existingOwner);
            throw Error("No changes to submit");
        }
        setUpdating(true);
        doUpdate(owner, photoToUpload);
    };
    let onChange = (e, {name, value}) => {
        console.debug(`Changing ${name} to`, value, "in", owner);
        let updated = Object.assign({}, owner);
        updated[name] = value;
        setEdited(true);
        setOwner(updated);
    };
    let onContactChange = (e, {name, value}) => {
        let contactType = name;
        console.debug(`Changing contact ${contactType} to ${value} in`, owner);
        let updatedContacts = Object.assign({}, owner.contacts);
        let toUpdate = updatedContacts[contactType] || {};
        toUpdate.value = value;
        updatedContacts[contactType] = toUpdate;
        onChange(null, {name: "contacts", value: updatedContacts});
    };
    let onPhotoSelected = (e) => {
        let file = e.target.files[0];
        setEdited(true);
        setPhotoToUpload(file);
    };

    return <EditBioForm {...{onSubmit, onChange, onContactChange, onPhotoSelected, reportSuccess, owner, edited}}
                        errorMessage={hasError && errorMessage}
                        loading={operationIsInProgress}/>
};

export const EditBioForm = function ({onSubmit, onChange, onContactChange, onPhotoSelected, reportSuccess, errorMessage, loading, owner, edited}) {

    return <Grid centered>
        <Grid.Column width={11}>
            <Segment raised>
                <h2>Edit bio</h2>
                <Form onSubmit={onSubmit}
                      loading={loading}
                      error={!!errorMessage}
                      success={reportSuccess}>
                    <Divider/>
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={11}>
                                <Form.Input label="Owner Name" placeholder="Name" value={owner.name || ""} name="name" onChange={onChange}/>
                                <Form.Input label="Owner Nickname" placeholder="Nickname" value={owner.nickname || ""} name="nickname" onChange={onChange}/>
                                <Form.Input label="Owner E-Mail" placeholder="E-Mail" value={_.get(owner, "contacts.email.value", "")} name="email" onChange={onContactChange}/>
                                <Form.Input label="Owner Short Bio" placeholder="Description" value={owner.description || ""} name="description" onChange={onChange}/>
                                <SuccessMessage message="Changes successfully saved"/>
                                <ErrorMessage message={errorMessage}/>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <PhotoUpload existingPhotoId={owner.photoId} onPhotoSelected={onPhotoSelected}/>
                                <Button primary type="submit" active={edited}>Save</Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <BioTextArea bio={owner.bio} onBioChange={(e, {value}) => onChange(e, {name: "bio", value})}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const PhotoUpload = function ({existingPhotoId, onPhotoSelected}) {
    return <Form.Field>
        <label>Photo</label>
        <div className="image">
            { existingPhotoId && <Image src={imageUrl(existingPhotoId)} alt="Owner photo"/>}
        </div>
        <Input type="file" accept="image/*" onChange={onPhotoSelected}/>
    </Form.Field>
};

export const BioTextArea = function ({bio, onBioChange}) {
    return <TextArea label="Bio" placeholder="Something about me..." value={bio || ""} name="bio" onChange={onBioChange}/>
};