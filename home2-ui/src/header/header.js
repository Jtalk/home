import React from "react";
import HeaderOwner from "./header-owner";
import {Menu} from "semantic-ui-react";
import HeaderMenuItem from "./header-menu-item";
import HeaderMenuDropdownItem from "./header-menu-dropdown-item";
import HeaderSearch from "./header-search";
import assert from "assert";

class Header extends React.Component {

    render() {
        return <Menu secondary pointing>
            <HeaderOwner ownerName={this.props.ownerName}/>
            {this._items()}
            <Menu.Menu position="right">
                <HeaderSearch/>
            </Menu.Menu>
        </Menu>
    }

    static buildLink(title, href) {
        return HeaderMenuItem.buildLink(title, href);
    }

    static buildSubmenuLinks(title, submenu) {
        assert(submenu.length > 0, "Empty submenu was provided for " + title);
        return {title: title, submenu: submenu}
    }

    _items() {
        return this.props.links.map(link => {
            if (link.submenu) {
                return <HeaderMenuDropdownItem key={link.title} title={link.title} activeLink={this.props.activeLink} items={link.submenu}/>
            } else {
                return <HeaderMenuItem key={link.key} link={link} activeLink={this.props.activeLink}/>
            }
        });
    }
}

export default Header;