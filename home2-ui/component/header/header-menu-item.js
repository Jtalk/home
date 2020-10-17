import React from "react";
import {Link} from "react-router-dom";
import {Icon} from "semantic-ui-react";

export const HeaderMenuItem = function ({title, href, active, icon}) {
    icon = icon || null;
    return <Link to={href} className={active ? "active item" : "item"}>
        {icon && <Icon name={icon}/>}
        {title}
    </Link>
};
