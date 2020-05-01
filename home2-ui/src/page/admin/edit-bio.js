import React from "react";
import {useOwner, useOwnerError, useOwnerLoading, useOwnerUpdater, useOwnerUpdating} from "../../data/reduce/owner";
import {useForm} from "./common/use-form";
import {Loading, Updating} from "../../data/reduce/global/enums";
import {Button, Divider, Form, Grid, Input, Segment, TextArea} from "semantic-ui-react";
import {get as _get} from "lodash-es";
import {ErrorMessage, SuccessMessage} from "../../component/form-message";
import {imageUrl} from "../../utils/image";
import {ImageUploadPreview} from "./common/image-upload-preview";
import {Titled} from "react-titled";

export const EditBio = function () {

    let owner = useOwner();
    let loading = useOwnerLoading();
    let updateStatus = useOwnerUpdating();
    let errorMessage = useOwnerError();

    let onUpdate = useOwnerUpdater();

    let {onSubmit, data, updater, canSubmit} = useForm({
        init: owner,
    });

    return <EditBioStateless onSubmit={onSubmit(onUpdate)} {...{loading, updateStatus, errorMessage, updater, data, canSubmit}}/>
};

export const EditBioStateless = function ({data, onSubmit, updater, loading, updateStatus, errorMessage, canSubmit}) {
    return <Grid centered>
        <Titled title={t => "Edit Bio | " + t}/>
        <Grid.Column width={11}>
            <Segment raised>
                <h2>Edit bio</h2>
                <Form onSubmit={onSubmit}
                      loading={loading === Loading.LOADING}
                      success={updateStatus === Updating.UPDATED}
                      error={updateStatus === Updating.ERROR || loading === Loading.ERROR}>
                    <Divider/>
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={11}>
                                <Form.Input label="Owner Name"
                                            placeholder="Name"
                                            value={data.name || ''}
                                            onChange={updater.change("name")}/>
                                <Form.Input label="Owner Nickname"
                                            placeholder="Nickname"
                                            value={data.nickname || ''}
                                            onChange={updater.change("nickname")}/>
                                <Form.Input label="Owner E-Mail"
                                            placeholder="E-Mail"
                                            value={_get(data, ["contacts", "email", "value"], '')}
                                            onChange={updater.change("contacts", "email", "value")}/>
                                <Form.Input label="Owner Short Bio"
                                            placeholder="Description"
                                            value={data.description || ''}
                                            onChange={updater.change("description")}/>
                                <SuccessMessage message="Changes successfully saved"/>
                                <ErrorMessage message={errorMessage}/>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <PhotoUpload existingPhotoId={data.photoId}
                                             onPhotoSelected={updater.changeFile("photo")}
                                             selectedPhoto={data.__files && data.__files["photo"]}/>
                                <Button primary type="submit" loading={updateStatus === Updating.UPDATING} disabled={!canSubmit}>Save</Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <BioTextArea bio={data.bio || ''}
                                             onChange={updater.change("bio")}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const PhotoUpload = function ({existingPhotoId, selectedPhoto, onPhotoSelected}) {
    selectedPhoto = selectedPhoto || imageUrl(existingPhotoId);
    return <Form.Field>
        <label>Photo</label>
        <div className="image">
            <ImageUploadPreview src={selectedPhoto} alt={"Owner photo"}/>
        </div>
        <Input type="file" accept="image/*" onChange={onPhotoSelected}/>
    </Form.Field>
};

export const BioTextArea = function ({bio, onChange}) {
    return <TextArea label="Bio" placeholder="Something about me..." value={bio} onChange={onChange}/>
};