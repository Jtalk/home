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
            {this.item("About", "/")}
            {this.item("Projects", "/projects")}
            {this.item("Blog", "/blog")}
            <HeaderMenuDropdownItem title="Item4" items={[
                {title: "Item4.1"},
                {title: "Item4.2", active: true},
                {title: "Item4.3"},
                {title: "Item4.4"},
            ]}/>
            <Menu.Menu position="right">
                <HeaderSearch/>
                <HeaderUserItem user="TestUser"/>
            </Menu.Menu>
        </Menu>
    }

    item(title, href) {
        return <HeaderMenuItem key={title} title={title} href={href} active={title === this.props.activeLink}/>
    }
}

export default Header;