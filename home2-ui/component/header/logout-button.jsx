import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import React from "react";
import { useLoggedIn, useLogoutHandler } from "../../data/hooks/authentication";

export default function LogoutButton({ as }) {
  let loggedIn = useLoggedIn();
  let logoutHandler = useLogoutHandler();
  let onClick = () => {
    loggedIn && logoutHandler();
  };
  const Component = as || Menu.Item;
  return (
    <Component data-id="logout-button" onClick={onClick} tooltip="Logout">
      <Icon name="sign-out" />
      Sign out
    </Component>
  );
}
