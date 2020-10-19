import {Icon, Menu} from "semantic-ui-react";
import React from "react";
import {useLoggedIn, useLogoutHandler} from "../../data/reduce/authentication/hooks";

export const LogoutButton = function () {
    let loggedIn = useLoggedIn();
    let logoutHandler = useLogoutHandler();
    let onClick = () => {
        loggedIn && logoutHandler();
    };
    return <Menu.Item onClick={onClick} tooltip="Logout">
        <Icon name="sign-out"/>Sign out
    </Menu.Item>
};
