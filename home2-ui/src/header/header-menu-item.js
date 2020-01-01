import React from "react";
import {Link} from "react-router-dom";
import {Menu} from "semantic-ui-react";

export const HeaderMenuItem = function ({link, active}) {
    let {title, href} = link;
    if (active) {
        return <Menu.Item active>{title}</Menu.Item>
    } else {
        return <Link to={href} className="item">{title}</Link>
    }
};

export function buildLink(title, href) {
    return {
        title: title,
        href: href,
        key: title
    }
}