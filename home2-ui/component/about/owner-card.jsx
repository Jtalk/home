import React, { useCallback, useState } from "react";
import { Loading } from "../../data/hooks/global/enums";
import get from "lodash/get";
import { ContentPlaceholderOr } from "../placeholder/content-placeholder";
import { LinePlaceholderOr } from "../placeholder/line-placeholder";
import { ImagePlaceholderOr } from "../placeholder/image-placeholder";
import { OptionalImage } from "../image/optional-image";
import { useLoggedIn } from "../../data/hooks/authentication/hooks";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import dynamic from "next/dynamic";
import { useOwner } from "../../data/hooks/owner/get";

export default function OwnerCard() {
  let { data: owner, loading } = useOwner();
  let loggedIn = useLoggedIn();

  let [loggingIn, setLoggingIn] = useState(false);

  const showLogin = useCallback(() => {
    loggedIn || setLoggingIn(true);
  }, [loggedIn]);
  const onCloseHandler = useCallback(() => setLoggingIn(false), []);

  const LoginModal = dynamic(() => import("../login/login"));

  return (
    <>
      <CardStateless loading={loading} owner={owner || {}} showLogin={showLogin} />
      <LoginModal enabled={loggingIn} onClose={onCloseHandler} />
    </>
  );
}

export const CardStateless = function ({ loading, owner, showLogin }) {
  let onNameClick = (e) => {
    if (e.altKey) {
      showLogin(e);
    }
  };
  return (
    <Card>
      <ImagePlaceholderOr square loading={loading === Loading.LOADING}>
        <OptionalImage wrapped id={owner.photoId} />
      </ImagePlaceholderOr>
      <Card.Content>
        <ContentPlaceholderOr header loading={loading === Loading.LOADING} lines={3}>
          <Card.Header onClick={onNameClick}>{owner.name}</Card.Header>
          <Card.Meta>{owner.nickname}</Card.Meta>
          <Card.Description>{owner.description}</Card.Description>
        </ContentPlaceholderOr>
      </Card.Content>
      <Card.Content extra icon="user">
        <LinePlaceholderOr length="short" loading={loading === Loading.LOADING}>
          {get(owner, "contacts.email.value", null)}
        </LinePlaceholderOr>
      </Card.Content>
    </Card>
  );
};
