import React from "react";
import {HeaderOwner} from "./header-owner";
import {Icon, Menu} from "semantic-ui-react";
import {HeaderSearch} from "./header-search";
import {useImmutableSelector} from "../utils/redux-store";
import {Login, logout} from "../data/reduce/authentication";
import {useDispatch} from "react-redux";
import {useAjax} from "../context/ajax-context";

export const Header = function ({children}) {
    let ownerName = useImmutableSelector("owner", ["data", "name"]);
    return <HeaderStateless {...{ownerName, children}}/>
};

export const HeaderStateless = function ({ownerName, children}) {
    return <Menu secondary pointing>
        <HeaderOwner ownerName={ownerName}/>
        {children}
        <Menu.Menu position="right">
            <HeaderSearch/>
            <LogoutButton/>
        </Menu.Menu>
    </Menu>
};

export const LogoutButton = function () {
    let ajax = useAjax();
    let dispatch = useDispatch();
    let loggedIn = useImmutableSelector("authentication", "login") === Login.LOGGED_IN;
    let onClick = () => {
        loggedIn && dispatch(logout(ajax));
    };
    if (loggedIn) {
        return <Menu.Item onClick={onClick} tooltip="Logout">
            <Icon name="sign-out"/>
        </Menu.Item>
    } else {
        return <div/>;
    }
};
