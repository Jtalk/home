import React from "react";
import Dropdown from "semantic-ui-react/dist/commonjs/modules/Dropdown";

export default function HeaderDropdownItem({ title, icon, children, ...props }) {
  return (
    <Dropdown icon={icon} text={title} className="item" {...props}>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}
