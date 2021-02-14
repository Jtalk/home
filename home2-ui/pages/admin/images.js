import React, { useState } from "react";
import { Pagination } from "../../component/pagination";
import { checkTruthy } from "../../utils/validation";
import { formatDateTime } from "../../utils/date-time";
import ImageUploader from "../../component/3rdparty/react-image-upload";
import classes from "./images.module.css";
import { ImageUploadPreview } from "../../component/admin/common/image-upload-preview";
import { Loading, Uploading } from "../../data/hooks/global/enums";
import { useRouter } from "next/router";
import { OwnerTitled } from "../../component/about/owner-titled";
import { SuccessMessage } from "../../component/message/success-message";
import { ErrorMessage } from "../../component/message/error-message";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Image from "semantic-ui-react/dist/commonjs/elements/Image";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import Loader from "semantic-ui-react/dist/commonjs/elements/Loader";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";
import { useImages } from "../../data/hooks/images/get";
import { useImageUploader } from "../../data/hooks/images/upload";
import { useImageDeleter } from "../../data/hooks/images/delete";
import Head from "next/head";

export default function EditImagesPage() {
  const router = useRouter();
  const { page = 0 } = router.query;
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/css/3rdparty/react-image-upload.css" />
      </Head>
      <EditImages page={page} />
    </>
  );
}

export const EditImages = function ({ page = 0 }) {
  const { data: images, pagination, loading: loadingStatus } = useImages(page) || [];
  const totalCount = pagination?.total;

  const { uploader: uploadImage, status: uploadStatus, error: errorMessage } = useImageUploader();
  const { deleter: deleteImage } = useImageDeleter();

  return (
    <EditImagesStateless
      {...{ loadingStatus, uploadStatus, errorMessage, images, page, totalCount, uploadImage, deleteImage }}
    />
  );
};

export const EditImagesStateless = function ({
  loadingStatus,
  uploadStatus,
  errorMessage,
  images,
  page,
  totalCount,
  deleteImage,
  uploadImage,
}) {
  return (
    <Grid centered>
      <OwnerTitled title={"Edit Images"} />
      <Grid.Column width={16}>
        <Segment basic>
          <h1>Uploaded Images</h1>
          <ImageUpload {...{ uploadImage, uploadStatus, errorMessage }} />
          <Divider hidden={true} />
          <LoadingViewImages {...{ loadingStatus, images, deleteImage }} />
          <Segment floated="right" compact basic>
            <Pagination current={page} total={totalCount} />
          </Segment>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export const LoadingViewImages = function ({ loadingStatus, images, deleteImage }) {
  if (loadingStatus === undefined || loadingStatus === Loading.LOADING) {
    return (
      <Loader active inline={"centered"}>
        Loading
      </Loader>
    );
  } else {
    return <ViewImages {...{ images, deleteImage }} />;
  }
};

export const ViewImages = function ({ images, deleteImage }) {
  return (
    <Card.Group>
      {images.map((image) => (
        <ViewImage key={image.id} {...image} deleteImage={deleteImage} />
      ))}
    </Card.Group>
  );
};

export const ViewImage = function ({ src, description, id, uploadedDateTime, deleteImage }) {
  checkTruthy(src, "Image src is not defined");
  checkTruthy(id, "Image id is not defined");
  return (
    <Card className="width-fit">
      <Image src={src} alt={description || "No description"} />
      <Card.Content>
        <Card.Description>
          <Button size="small" floated="right" color="red" onClick={() => deleteImage(id)}>
            Delete
          </Button>
          {description || null}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>{formatDateTime(uploadedDateTime)}</Card.Content>
    </Card>
  );
};

export const ImageUpload = function ({ uploadStatus, errorMessage, uploadImage }) {
  let [description, setDescription] = useState("");
  let [selectedFile, selectFile] = useState();
  let [isUploading, setUploading] = useState();
  if (isUploading && uploadStatus === Uploading.UPLOADED) {
    selectFile(null);
  }
  if (isUploading ^ (uploadStatus === Uploading.UPLOADING)) {
    setUploading(uploadStatus === Uploading.UPLOADING);
  }
  let onUploadClick = () => {
    setUploading(true);
    uploadImage({ description, file: selectedFile });
  };
  return (
    <ImageUploadStateless
      {...{ uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick }}
    />
  );
};

export const ImageUploadStateless = function ({
  uploadStatus,
  errorMessage,
  description,
  setDescription,
  selectedFile,
  selectFile,
  onUploadClick,
}) {
  return (
    <div>
      <Form error={uploadStatus === Uploading.ERROR} success={uploadStatus === Uploading.UPLOADED}>
        <SuccessMessage message="Image successfully uploaded" />
        <ErrorMessage message={errorMessage} />
        <Form.Input
          label="Description"
          placeholder="A description of the image"
          value={description}
          onChange={(_, newData) => setDescription(newData.value)}
        />
        <Container textAlign={"center"}>
          <ImageUploaderWithPreview selectedFile={selectedFile} onFileSelected={selectFile} />
          <Button.Group>
            <Button primary onClick={() => onUploadClick()}>
              Upload
            </Button>
            {selectedFile && [
              <Button.Or key="UploadOr" />,
              <Button negative key="UploadCancel" onClick={() => selectFile(null)}>
                Cancel
              </Button>,
            ]}
          </Button.Group>
        </Container>
      </Form>
    </div>
  );
};

export const ImageUploaderWithPreview = function ({ selectedFile, onFileSelected }) {
  if (selectedFile) {
    return (
      <ImageUploadPreview src={selectedFile} alt={"Image upload preview"} className={classes.imageUploadPreview} />
    );
  } else {
    const supportedTypes = ["jpg", "png", "gif", "svg"];
    return (
      <ImageUploader
        withIcon={true}
        withPreview={true}
        buttonText="Select Images"
        singleImage={true}
        label={"max 10mb, accepted: " + supportedTypes.join("|")}
        maxFileSize={10 * 1024 * 1024}
        imgExtension={supportedTypes.map((v) => `.${v}`)}
        onChange={(f) => onFileSelected(f[0])}
      />
    );
  }
};
