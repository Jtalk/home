import React from "react";
import Dropdown from "semantic-ui-react/dist/commonjs/modules/Dropdown";

export default function HeaderMenuDropdownItem({ title, icon, children }) {
  return (
    <Dropdown item icon={icon} text={title}>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}
