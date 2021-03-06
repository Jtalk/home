import React from "react";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import { useOwner } from "../../data/hooks/owner/get";

export const HeaderOwner = function () {
  const { data } = useOwner();
  const { name } = data || {};
  // A makeshift placeholder for an approx 15 char name before it's been loaded.
  let margin = name ? "10px" : "15ch";
  return (
    <Menu.Item data-id="header-owner-info">
      <img
        src="/images/icon16.png"
        className="icon"
        style={{ height: "16px", width: "16px", marginRight: margin }}
        alt="Icon"
      />
      <b>{name}</b>
    </Menu.Item>
  );
};
