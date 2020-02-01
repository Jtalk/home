import React from "react";
import {useDispatch} from "react-redux";
import {load, update as updateOwner} from "../data/reduce/owner";
import {useAjax, useAjaxLoader} from "../context/ajax-context";
import {useImmutableSelector} from "../utils/redux-store";
import {useForm} from "./common/use-form";
import {Loading, Updating} from "../data/reduce/global/enums";
import {useStateChange} from "../utils/state-change";
import {useDataUrl} from "../utils/file-converter-context";
import {Button, Divider, Form, Grid, Input, Segment, TextArea} from "semantic-ui-react";
import _ from "lodash";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {imageUrl} from "../utils/image";
import {ImageUploadPreview} from "./common/image-upload-preview";

export const EditBio = function () {

    useAjaxLoader(load);

    let ajax = useAjax();
    let dispatch = useDispatch();
    let owner = useImmutableSelector("owner", ["data"]);
    let [loadingStatusChanged, loadingStatus] = useStateChange("owner", ["loading"], {from: Loading.LOADING, to: Loading.READY});
    let updateStatus = useImmutableSelector("owner", ["updating"]);
    let errorMessage = useImmutableSelector("owner", ["errorMessage"]);
    let {onSubmit, data, updater, canSubmit} = useForm({
        init: owner,
        updateStatus
    });

    if (loadingStatusChanged) {
        updater.reloaded(owner);
    }
    let onUpdate = (owner, {photo}) => {
        dispatch(updateOwner(ajax, owner, photo));
    };

    return <EditBioStateless onSubmit={onSubmit(onUpdate)} {...{loadingStatus, updateStatus, errorMessage, updater, data, canSubmit}}/>
};

export const EditBioStateless = function ({data, onSubmit, updater, loadingStatus, updateStatus, errorMessage, canSubmit, selectedPhotoDataUrl}) {
    return <Grid centered>
        <Grid.Column width={11}>
            <Segment raised>
                <h2>Edit bio</h2>
                <Form onSubmit={onSubmit}
                      loading={loadingStatus === Loading.LOADING}
                      success={updateStatus === Updating.UPDATED}
                      error={updateStatus === Updating.ERROR || loadingStatus === Loading.ERROR}>
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
                                            value={_.get(data, ["contacts", "email", "value"], '')}
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
                                             selectedPhoto={data.__files && data.__files.photo}/>
                                <Button primary type="submit" disabled={!canSubmit}>Save</Button>
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

export const BioTextArea = function ({bio, onChange, name}) {
    return <TextArea label="Bio" placeholder="Something about me..." value={bio} onChange={onChange}/>
};