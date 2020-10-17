import React from "react";
import {HeaderOwner} from "./header-owner";
import {Icon, Menu} from "semantic-ui-react";
import {useLoggedIn, useLogoutHandler} from "../../data/reduce/authentication";

export const Header = function ({children}) {
    return <HeaderStateless>
        {children}
    </HeaderStateless>
};

export const HeaderStateless = function ({children}) {
    return <Menu secondary pointing>
        <HeaderOwner/>
        {children}
    </Menu>
};

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
