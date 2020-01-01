import React from "react";
import {Menu} from "semantic-ui-react";

export const HeaderOwner = function ({ownerName}) {
    // Avoid ugly margin if owner name has not yet been loaded
    let margin = ownerName ? '10px' : '0px';
    return <Menu.Item>
        <img src="/images/icon16.png" style={{height: '16px', width: '16px', marginRight: margin}} alt="Icon"/>
        <b>{ownerName}</b>
    </Menu.Item>
};
