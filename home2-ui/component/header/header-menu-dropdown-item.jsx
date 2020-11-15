import React from "react";
import Dropdown from "semantic-ui-react/dist/commonjs/modules/Dropdown";

export default function HeaderMenuDropdownItem({ title, icon, children, ...props }) {
  return (
    <Dropdown item icon={icon} text={title} {...props}>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}
