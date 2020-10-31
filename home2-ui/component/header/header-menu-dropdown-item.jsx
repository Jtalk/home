import React from "react";
import dynamic from "next/dynamic";

export const HeaderMenuDropdownItem = function ({title, icon, children}) {
    const Dropdown = dynamic(() => import("semantic-ui-react/dist/commonjs/modules/Dropdown"));
    return <Dropdown item icon={icon} text={title}>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
};
