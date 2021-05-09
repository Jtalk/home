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
import styles from "./owner-card.module.css";
import ImageLoading from "react-image-loading";
import Placeholder from "semantic-ui-react/dist/commonjs/elements/Placeholder";

const LoginModal = dynamic(() => import("../login/login"));

export default function OwnerCard() {
  let { data: owner, loading } = useOwner();
  let loggedIn = useLoggedIn();

  let [loggingIn, setLoggingIn] = useState(false);

  const showLogin = useCallback(() => {
    loggedIn || setLoggingIn(true);
  }, [loggedIn]);
  const onCloseHandler = useCallback(() => setLoggingIn(false), []);

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
    <Card data-id="owner-card">
      <ImagePlaceholderOr rectangular loading={loading === Loading.LOADING}>
        <ImageLoading>
          {(ref, status) => (
            <>
              <OptionalImage ref={ref} className={styles.photo} data-id="owner-photo" id={owner.photoId} />
              {status === "loading" && (
                <Placeholder>
                  <Placeholder.Image rectangular />
                </Placeholder>
              )}
            </>
          )}
        </ImageLoading>
      </ImagePlaceholderOr>
      <Card.Content>
        <ContentPlaceholderOr header loading={loading === Loading.LOADING} lines={3}>
          <Card.Header data-id="owner-name" as="h3" onClick={onNameClick}>
            {owner.name}
          </Card.Header>
          <Card.Meta className={styles.abbreviated} data-id="owner-nickname">
            {owner.nickname}
          </Card.Meta>
          <Card.Description data-id="owner-description">{owner.description}</Card.Description>
        </ContentPlaceholderOr>
      </Card.Content>
      <Card.Content extra icon="user" data-id="owner-contacts">
        <LinePlaceholderOr length="short" loading={loading === Loading.LOADING}>
          <span className={styles.abbreviated} data-id="owner-email">
            {get(owner, "contacts.email.value", null)}
          </span>
        </LinePlaceholderOr>
      </Card.Content>
    </Card>
  );
};
