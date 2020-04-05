import React from "react";
import {Dropdown} from "semantic-ui-react";

export const HeaderMenuDropdownItem = function ({title, children}) {

    return <Dropdown item text={title}>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
};
