import React from "react";
import {Link} from "react-router-dom";

export const HeaderMenuItem = function ({title, href, active}) {
    return <Link to={href} className={active ? "active item" : "item"}>{title}</Link>
};
