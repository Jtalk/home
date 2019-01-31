import React from "react";
import HeaderOwner from "./header-owner";
import {Menu} from "semantic-ui-react";
import HeaderMenuItem from "./header-menu-item";
import HeaderMenuDropdownItem from "./header-menu-dropdown-item";
import HeaderSearch from "./header-search";
import HeaderUserItem from "./header-user-item";

class Header extends React.Component {

    render() {
        return <Menu secondary pointing>
            <HeaderOwner ownerName={this.props.ownerName}/>
            {this._items()}
            <Menu.Menu position="right">
                <HeaderSearch/>
                <HeaderUserItem user="TestUser"/>
            </Menu.Menu>
        </Menu>
    }

    static buildLink(title, path, render, exact = false) {
        return {title: title, path: path, render: render, exact: exact}
    }

    static buildSubmenu(title, links) {
        return {title: title, routes: links.map(HeaderMenuDropdownItem.buildLink)}
    }

    _items() {
        return this.props.links.map(link => {
            if (link.routes) {
                return <HeaderMenuDropdownItem key={link.title} title={link.title} activeLink={this.props.activeLink} items={link.routes}/>
            } else {
                return <HeaderMenuItem key={link.title} title={link.title} href={link.path} active={link.title === this.props.activeLink}/>
            }
        });
    }
}

export default Header;