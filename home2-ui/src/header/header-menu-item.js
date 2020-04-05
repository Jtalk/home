import React from "react";
import {Link} from "react-router-dom";
import {Menu} from "semantic-ui-react";

export const HeaderMenuItem = function ({title, href, active}) {
    if (active) {
        return <Menu.Item active>{title}</Menu.Item>
    } else {
        return <Link to={href} className="item">{title}</Link>
    }
};
