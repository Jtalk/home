import React, {useEffect, useState} from "react";
import {Button, Card, Container, Divider, Form, Grid, Image, Loader, Segment} from "semantic-ui-react";
import {useImmutableSelector} from "../utils/redux-store";
import {Pagination} from "../shared/pagination";
import {checkTruthy} from "../utils/validation";
import {formatDateTime} from "../utils/date-time";
import ImageUploader from "react-images-upload";
import {useAjax, useAjaxLoader} from "../context/ajax-context";
import * as image_redux from "../data/reduce/images";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {useDispatch} from "react-redux";
import "./edit-images.css";
import {useDataUrl} from "../utils/file-converter-context";
import {Loading, Uploading} from "../data/reduce/global/enums";
import {ImageUploadPreview} from "./common/image-upload-preview";

export const EditImages = function ({ownerName}) {
    useEffect(() => {
        document.title = ownerName + ": Edit Images";
    }, [ownerName]);
    useAjaxLoader(image_redux.load);
    let ajax = useAjax();
    let dispatch = useDispatch();

    let loadingStatus = useImmutableSelector("images", ["loading", "status"]);
    let uploadStatus = useImmutableSelector("images", ["uploading", "status"]);
    let errorMessage = useImmutableSelector("images", ["uploading", "error", "message"]);
    let currentState = useImmutableSelector("images", ["data"]);
    let images = currentState.images;
    let pagination = currentState.pagination;

    let deleteImage = (id) => dispatch(image_redux.delete_(ajax, id, currentState));
    let uploadImage = (desc, file) => dispatch(image_redux.upload(ajax, desc, file));

    return <EditImagesStateless {...{ownerName, loadingStatus, uploadStatus, errorMessage, images, pagination, uploadImage, deleteImage}}/>
};

export const EditImagesStateless = function ({loadingStatus, uploadStatus, errorMessage, images, pagination, deleteImage, uploadImage}) {
    return <Grid centered>
        <Grid.Column width={16}>
            <Segment basic>
                <h1>Uploaded Images</h1>
                <ImageUpload {...{uploadImage, uploadStatus, errorMessage}}/>
                <Divider hidden={true}/>
                <LoadingViewImages {...{loadingStatus, images, deleteImage}}/>
                <Segment floated="right" compact basic>
                    <Pagination {...pagination}/>
                </Segment>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const LoadingViewImages = function ({loadingStatus, images, deleteImage}) {

    if (loadingStatus === undefined || loadingStatus === Loading.LOADING) {
        return <Loader active inline={'centered'}>Loading</Loader>
    } else {
        return <ViewImages {...{images, deleteImage}}/>
    }
};

export const ViewImages = function ({images, deleteImage}) {
    return <Card.Group>
        {images.map(image => <ViewImage key={image.id} {...image} deleteImage={deleteImage}/>)}
    </Card.Group>
};

export const ViewImage = function ({src, description, id, uploadedDateTime, deleteImage}) {
    checkTruthy(src, "Image src is not defined");
    checkTruthy(id, "Image id is not defined");
    return <Card className="width-fit">
        <Image src={src} alt={description || "No description"}/>
        <Card.Content>
            <Card.Description>
                <Button size="small" floated="right" color="red"
                        onClick={() => deleteImage(id)}>Delete</Button>
                {description || null}
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
            {formatDateTime(uploadedDateTime)}
        </Card.Content>
    </Card>
};

export const ImageUpload = function ({uploadStatus, errorMessage, uploadImage}) {
    let [description, setDescription] = useState("");
    let [fileSelected, selectFile] = useState();
    let [isUploading, setUploading] = useState();
    if (isUploading && uploadStatus === Uploading.UPLOADED) {
        selectFile(null);
    }
    if (isUploading ^ uploadStatus === Uploading.UPLOADING) {
        setUploading(uploadStatus === Uploading.UPLOADING);
    }
    let previewDataUrl = useDataUrl(fileSelected);
    let onUploadClick = () => {
        setUploading(true);
        uploadImage(description, fileSelected);
    };
    return <ImageUploadStateless {...{uploadStatus, errorMessage, description, setDescription, previewDataUrl, selectFile, onUploadClick}}/>
};

export const ImageUploadStateless = function ({uploadStatus, errorMessage, description, setDescription, previewDataUrl, selectFile, onUploadClick}) {
    return <div>
        <Form error={uploadStatus === Uploading.ERROR} success={uploadStatus === Uploading.UPLOADED}>
            <SuccessMessage message="Image successfully uploaded"/>
            <ErrorMessage message={errorMessage}/>
            <Form.Input label="Description"
                        placeholder="A description of the image"
                        value={description}
                        onChange={(_, newData) => setDescription(newData.value)}/>
            <Container textAlign={'center'}>
                <ImageUploaderWithPreview previewDataUrl={previewDataUrl} onFileSelected={selectFile}/>
                <Button.Group>
                    <Button primary onClick={() => onUploadClick()}>Upload</Button>
                    {previewDataUrl && [
                        <Button.Or key="UploadOr"/>,
                        <Button negative key="UploadCancel" onClick={() => selectFile(null)}>Cancel</Button>
                    ]}
                </Button.Group>
            </Container>
        </Form>
    </div>
};

export const ImageUploaderWithPreview = function ({previewDataUrl, onFileSelected}) {
    if (previewDataUrl) {
        return <ImageUploadPreview src={previewDataUrl} alt={"Image upload preview"} className={"image-upload-preview"}/>
    } else {
        return <ImageUploader
            withIcon={true}
            withPreview={true}
            buttonText="Choose Images"
            singleImage={true}
            onChange={f => onFileSelected(f[0])}/>
    }
};
