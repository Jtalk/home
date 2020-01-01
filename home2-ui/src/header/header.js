import React from "react";
import {HeaderOwner} from "./header-owner";
import {Menu} from "semantic-ui-react";
import {HeaderMenuItem, buildLink as headerMenuBuildLink} from "./header-menu-item";
import {HeaderMenuDropdownItem} from "./header-menu-dropdown-item";
import {HeaderSearch} from "./header-search";
import assert from "assert";
import {Titled} from "react-titled";
import {title} from "../utils/title-utils";

export const Header = function ({ownerName, links, activeLink}) {
    return <Titled title={prev => title(prev, activeLink)}>
        <Menu secondary pointing>
            <HeaderOwner ownerName={ownerName}/>
            {items(links, activeLink)}
            <Menu.Menu position="right">
                <HeaderSearch/>
            </Menu.Menu>
        </Menu>
    </Titled>
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
