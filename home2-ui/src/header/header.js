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
            <HeaderMenuItem title="Item1" href="/item1.html"/>
            <HeaderMenuItem title="Item2" href="/item2.html" active={true}/>
            <HeaderMenuItem title="Item3" href="/item3.html"/>
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
}

export default Header;