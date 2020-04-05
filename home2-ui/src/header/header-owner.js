import React from "react";
import {Menu} from "semantic-ui-react";
import {useOwner} from "../data/reduce/owner";

export const HeaderOwner = function () {
    let {name} = useOwner();
    // Avoid ugly margin if owner name has not yet been loaded
    let margin = name ? '10px' : '0px';
    return <Menu.Item>
        <img src="/images/icon16.png" style={{height: '16px', width: '16px', marginRight: margin}} alt="Icon"/>
        <b>{name}</b>
    </Menu.Item>
};
