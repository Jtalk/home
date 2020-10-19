import React from "react";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import {useOwner} from "../../data/reduce/owner";

export const HeaderOwner = function () {
    let {name} = useOwner();
    // A makeshift placeholder for an approx 15 char name before it's been loaded.
    let margin = name ? '10px' : '15ch';
    return <Menu.Item>
        <img src="/images/icon16.png" style={{height: '16px', width: '16px', marginRight: margin}} alt="Icon"/>
        <b>{name}</b>
    </Menu.Item>
};
