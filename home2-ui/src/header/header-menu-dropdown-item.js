import React from "react";
import {Dropdown} from "semantic-ui-react";
import {Link} from "react-router-dom";

export default class HeaderMenuDropdownItem extends React.Component {

    render() {
        return <Dropdown item text={this.props.title}>
            <Dropdown.Menu>
                {this.props.items.map(item =>
                    <Link to={item.href}
                          className={"ui dropdown " + HeaderMenuDropdownItem._activeClass(item.title === this.props.activeLink)}
                          key={item.title}>
                        {item.title}
                    </Link>
                )}
            </Dropdown.Menu>
        </Dropdown>
    }

    static _activeClass(active) {
        return active ? "active item" : "item";
    }
}