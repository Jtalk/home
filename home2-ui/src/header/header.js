import React from "react";
import {HeaderOwner} from "./header-owner";
import {Icon, Menu} from "semantic-ui-react";
import {buildLink as headerMenuBuildLink, HeaderMenuItem} from "./header-menu-item";
import {HeaderMenuDropdownItem} from "./header-menu-dropdown-item";
import {HeaderSearch} from "./header-search";
import assert from "assert";
import {Titled} from "react-titled";
import {title} from "../utils/title-utils";
import {useImmutableSelector} from "../utils/redux-store";
import {Login, logout} from "../data/reduce/authentication";
import {useDispatch} from "react-redux";
import {useAjax} from "../context/ajax-context";

export const Header = function ({links, activeLink}) {
    let ownerName = useImmutableSelector("owner", ["data", "name"]);
    return <HeaderStateless {...{ownerName, links, activeLink}}/>
};

export const HeaderStateless = function({ownerName, links, activeLink}) {
    return <Titled title={prev => title(prev, activeLink)}>
        <Menu secondary pointing>
            <HeaderOwner ownerName={ownerName}/>
            {items(links, activeLink)}
            <Menu.Menu position="right">
                <HeaderSearch/>
                <LogoutButton/>
            </Menu.Menu>
        </Menu>
    </Titled>
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

function items(links, activeLink) {
    return links.map(link => {
        if (link.submenu) {
            return <HeaderMenuDropdownItem key={link.title} title={link.title} activeLink={activeLink} items={link.submenu}/>
        } else {
            return <HeaderMenuItem key={link.key} link={link} active={link.title === activeLink}/>
        }
    });
}

export function buildLink(title, href) {
    return headerMenuBuildLink(title, href);
}

export function buildSubmenuLinks(title, submenu) {
    assert(submenu.length > 0, "Empty submenu was provided for " + title);
    return {title: title, submenu: submenu}
}
