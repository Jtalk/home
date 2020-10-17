import React from "react";
import {Icon} from "semantic-ui-react";
import Link from "next/link";

export const HeaderMenuItem = function ({title, href, active, exact, icon}) {
    icon = icon || null;
    const isActive = exact ? active === href : active.startsWith(href);
    return <Link href={href}>
        <a className={isActive ? "active item" : "item"}>
            {icon && <Icon name={icon}/>}
            {title}
        </a>
    </Link>
};
