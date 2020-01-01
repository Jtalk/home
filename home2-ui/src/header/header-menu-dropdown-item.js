import React from "react";
import {Dropdown} from "semantic-ui-react";
import {Link} from "react-router-dom";

export const HeaderMenuDropdownItem = function ({title, items, activeLink}) {

    return <Dropdown item text={title}>
        <Dropdown.Menu>
            {items.map(item =>
                <Link to={item.href}
                      className={"ui dropdown " + itemClass(item.title === activeLink)}
                      key={item.title}>
                    {item.title}
                </Link>
            )}
        </Dropdown.Menu>
    </Dropdown>
};

function itemClass(active) {
    return active ? "active item" : "item";
}