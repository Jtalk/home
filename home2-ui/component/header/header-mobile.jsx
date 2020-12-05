import React from "react";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import { useRouter } from "next/router";
import { useLoggedIn } from "../../data/hooks/authentication";
import dynamic from "next/dynamic";
import { useOwner } from "../../data/hooks/owner/get";
import { dynamicSSR } from "../../utils/dynamic-import";
import styles from "./header-mobile.module.css";
import Dropdown from "semantic-ui-react/dist/commonjs/modules/Dropdown";
import MainMenu from "./main-menu";
import AccountMenu from "./account-menu";
import AdminMenu from "./admin-menu";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";

export default function HeaderMobile() {
  const router = useRouter();
  const activeRoute = router.pathname;

  const { data: owner } = useOwner();
  const authenticated = useLoggedIn();

  return (
    <HeaderMobileStateless
      data-id="header-mobile"
      className={styles.mobile}
      authenticated={authenticated}
      activeRoute={activeRoute}
      ownerName={owner?.name || ""}
    />
  );
}

const HeaderMobileStateless = function ({ ownerName, activeRoute, authenticated, ...rest }) {
  const HeaderSearch = dynamic(() => import("./header-search"), { ssr: dynamicSSR() });

  return (
    <div {...rest}>
      <Menu pointing fluid data-id="header">
        <Dropdown compact item simple icon="wrench" data-id="header">
          <Dropdown.Menu>
            <MainMenu type="menu" activeRoute={activeRoute} authenticated={authenticated} />
            {authenticated && (
              <Dropdown.Item>
                <Icon name="dropdown" />
                <span>Admin</span>
                <Dropdown.Menu data-id="header-admin-dropdown">
                  <AdminMenu activeRoute={activeRoute} />
                </Dropdown.Menu>
              </Dropdown.Item>
            )}
            {authenticated && (
              <Dropdown.Item>
                <Icon name="dropdown" />
                <span>Account</span>
                <Dropdown.Menu data-id="header-account-dropdown">
                  <AccountMenu type="menu" activeRoute={activeRoute} ownerName={ownerName} />
                </Dropdown.Menu>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
        <div className={styles.search}>
          <HeaderSearch />
        </div>
      </Menu>
    </div>
  );
};
