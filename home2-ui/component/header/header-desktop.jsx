import React from "react";
import { HeaderOwner } from "./header-owner";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import { useRouter } from "next/router";
import { useLoggedIn } from "../../data/hooks/authentication";
import dynamic from "next/dynamic";
import { useOwner } from "../../data/hooks/owner/get";
import { dynamicSSR } from "../../utils/dynamic-import";
import styles from "./header-desktop.module.css";
import MainMenu from "./main-menu";
import AccountMenu from "./account-menu";
import HeaderDropdownItem from "./header-dropdown-item";
import AdminMenu from "./admin-menu";

export default function HeaderDesktop() {
  const router = useRouter();
  const activeRoute = router.pathname;

  const { data: owner } = useOwner();
  const authenticated = useLoggedIn();

  return (
    <HeaderDesktopStateless
      className={styles.desktop}
      authenticated={authenticated}
      activeRoute={activeRoute}
      ownerName={owner?.name || ""}
    />
  );
}

export const HeaderDesktopStateless = function ({ ownerName, activeRoute, authenticated, className }) {
  const HeaderSearch = dynamic(() => import("./header-search"), { ssr: dynamicSSR() });

  return (
    <div className={className}>
      <Menu secondary pointing data-id="header" className={className}>
        <HeaderOwner />
        <MainMenu type="bar" activeRoute={activeRoute} authenticated={authenticated} />
        {authenticated && (
          <HeaderDropdownItem data-id="header-admin-dropdown" title={"Admin"}>
            <AdminMenu activeRoute={activeRoute} />
          </HeaderDropdownItem>
        )}
        <Menu.Menu position="right">
          <HeaderSearch />
          {authenticated && (
            <HeaderDropdownItem data-id="header-account-dropdown" icon={"user"}>
              <AccountMenu type="bar" activeRoute={activeRoute} ownerName={ownerName} />
            </HeaderDropdownItem>
          )}
        </Menu.Menu>
      </Menu>
    </div>
  );
};
