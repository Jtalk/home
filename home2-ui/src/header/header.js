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
            <HeaderOwner ownerName={this.props.ownerName} />
            {this._item("About", "/")}
            {this._item("Projects", "/projects")}
            {this._item("Blog", "/blog")}
            <HeaderMenuDropdownItem title="Admin" items={[
                {title: "Edit Projects", href: "/admin/projects"},
                {title: "Edit Blog", href: "/admin/blog/articles"},
                {title: "Edit Images", href: "/admin/images"},
                {title: "Edit Footer", href: "/admin/footer"},
            ]}/>
            <Menu.Menu position="right">
                <HeaderSearch/>
                <HeaderUserItem user="TestUser"/>
            </Menu.Menu>
        </Menu>
    }

    _items() {
        return this.props.links.map(link => {
            return this._item(link.title, link.path)
        });
    }

    _item(title, href) {
        return <HeaderMenuItem key={title} title={title} href={href} active={title === this.props.activeLink}/>
    }
}

export default Header;