import React from "react";
import {Dropdown} from "semantic-ui-react";

export const HeaderMenuDropdownItem = function ({title, icon, children}) {

    return <Dropdown item icon={icon} text={title}>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
};
