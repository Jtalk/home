import React from "react";
import { useForm } from "../../component/admin/common/use-form";
import { Loading, Updating } from "../../data/hooks/global/enums";
import { imageUrl } from "../../utils/image";
import { ImageUploadPreview } from "../../component/admin/common/image-upload-preview";
import get from "lodash/get";
import { OwnerTitled } from "../../component/about/owner-titled";
import { SuccessMessage } from "../../component/message/success-message";
import { ErrorMessage } from "../../component/message/error-message";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Input from "semantic-ui-react/dist/commonjs/elements/Input";
import TextArea from "semantic-ui-react/dist/commonjs/addons/TextArea";
import { useOwner, useOwnerLoading } from "../../data/hooks/owner/get";
import { useOwnerUpdater } from "../../data/hooks/owner/update";

export default function EditBio() {
  let owner = useOwner() || {};
  let loading = useOwnerLoading();

  let { updater: onUpdate, status: updateStatus, error: errorMessage } = useOwnerUpdater();

  let { onSubmit, data, updater, canSubmit } = useForm({
    init: owner,
  });

  return (
    <EditBioStateless
      onSubmit={onSubmit(onUpdate)}
      {...{ loading, updateStatus, errorMessage, updater, data, canSubmit }}
    />
  );
}

export const EditBioStateless = function ({ data, onSubmit, updater, loading, updateStatus, errorMessage, canSubmit }) {
  return (
    <Grid centered>
      <OwnerTitled title={"Edit Bio"} />
      <Grid.Column width={11}>
        <Segment raised>
          <h2>Edit bio</h2>
          <Form
            onSubmit={onSubmit}
            loading={loading === Loading.LOADING}
            success={updateStatus === Updating.UPDATED}
            error={updateStatus === Updating.ERROR || loading === Loading.ERROR}
          >
            <Divider />
            <Grid stackable>
              <Grid.Row>
                <Grid.Column width={11}>
                  <Form.Input
                    label="Owner Name"
                    placeholder="Name"
                    value={data.name || ""}
                    onChange={updater.change("name")}
                  />
                  <Form.Input
                    label="Owner Nickname"
                    placeholder="Nickname"
                    value={data.nickname || ""}
                    onChange={updater.change("nickname")}
                  />
                  <Form.Input
                    label="Owner E-Mail"
                    placeholder="E-Mail"
                    value={get(data, ["contacts", "email", "value"], "")}
                    onChange={updater.change("contacts", "email", "value")}
                  />
                  <Form.Input
                    label="Owner Short Bio"
                    placeholder="Description"
                    value={data.description || ""}
                    onChange={updater.change("description")}
                  />
                  <SuccessMessage message="Changes successfully saved" />
                  <ErrorMessage message={errorMessage} />
                </Grid.Column>
                <Grid.Column width={5}>
                  <PhotoUpload
                    existingPhotoId={data.photoId}
                    onPhotoSelected={updater.changeFile("photo")}
                    selectedPhoto={data.__files && data.__files["photo"]}
                  />
                  <Button primary type="submit" loading={updateStatus === Updating.UPDATING} disabled={!canSubmit}>
                    Save
                  </Button>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={16}>
                  <BioTextArea bio={data.bio || ""} onChange={updater.change("bio")} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export const PhotoUpload = function ({ existingPhotoId, selectedPhoto, onPhotoSelected }) {
  selectedPhoto = selectedPhoto || imageUrl(existingPhotoId);
  return (
    <Form.Field>
      <label>Photo</label>
      <div className="image">
        <ImageUploadPreview src={selectedPhoto} alt={"Owner photo"} />
      </div>
      <Input type="file" accept="image/*" onChange={onPhotoSelected} />
    </Form.Field>
  );
};

export const BioTextArea = function ({ bio, onChange }) {
  return <TextArea label="Bio" placeholder="Something about me..." value={bio} onChange={onChange} />;
};
