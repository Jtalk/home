import React from "react";
import {Icon} from "semantic-ui-react";
import Link from "next/link";

export const HeaderMenuItem = function ({title, href, active, icon}) {
    icon = icon || null;
    return <Link href={href}>
        <a className={active ? "active item" : "item"}>
            {icon && <Icon name={icon}/>}
            {title}
        </a>
    </Link>
};
