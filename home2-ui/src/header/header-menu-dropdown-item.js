import React from "react";
import {Dropdown} from "semantic-ui-react";
import {Link} from "react-router-dom";

export default class HeaderMenuDropdownItem extends React.Component {

    render() {
        return <Dropdown item text={this.props.title}>
            <Dropdown.Menu>
                {this.props.items.map(item =>
                    <Link to={item.path}
                          className={"ui dropdown " + HeaderMenuDropdownItem._activeClass(item.title === this.props.activeLink)}
                          key={item.title}>
                        {item.title}
                    </Link>
                )}
            </Dropdown.Menu>
        </Dropdown>
    }

    static buildLink(title, path, render, exact = false) {
        return {title: title, path: path, render: render, exact: exact}
    }

    static _activeClass(active) {
        return active ? "active item" : "item";
    }
}