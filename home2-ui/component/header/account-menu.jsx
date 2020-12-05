import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import Dropdown from "semantic-ui-react/dist/commonjs/modules/Dropdown";
import dynamic from "next/dynamic";
import { dynamicSSR } from "../../utils/dynamic-import";
import { HeaderMenuItem } from "./header-menu-item";
import React from "react";

export default function AccountMenu({ type, ownerName, activeRoute }) {
  const Header = type === "menu" ? Menu.Header : Dropdown.Header;
  const logoutAs = type === "menu" ? Menu.Item : Dropdown.Item;

  const LogoutButton = dynamic(() => import("./logout-button"), { ssr: dynamicSSR() });
  return (
    <>
      <Header data-id="account-name" icon="user" content={ownerName} />
      <div className="divider" />
      <HeaderMenuItem
        active={activeRoute}
        data-id="settings"
        title={"Account"}
        icon={"settings"}
        href={"/admin/account"}
      />
      <LogoutButton as={logoutAs} />
    </>
  );
}
