import React from "react";
import {HeaderOwner} from "./header-owner";
import {Icon, Menu} from "semantic-ui-react";
import {HeaderSearch} from "./header-search";
import {useLoggedIn, useLogoutHandler} from "../data/reduce/authentication";

export const Header = function ({children}) {
    return <HeaderStateless>
        {children}
    </HeaderStateless>
};

export const HeaderStateless = function ({children}) {
    return <Menu secondary pointing>
        <HeaderOwner/>
        {children}
        <Menu.Menu position="right">
            <HeaderSearch/>
            <LogoutButton/>
        </Menu.Menu>
    </Menu>
};

export const LogoutButton = function () {
    let loggedIn = useLoggedIn();
    let logoutHandler = useLogoutHandler();
    let onClick = () => {
        loggedIn && logoutHandler();
    };
    if (loggedIn) {
        return <Menu.Item onClick={onClick} tooltip="Logout">
            <Icon name="sign-out"/>
        </Menu.Item>
    } else {
        return <div/>;
    }
};
