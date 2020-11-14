import React from "react";
import { HeaderOwner } from "./header-owner";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import { HeaderMenuItem } from "./header-menu-item";
import { useRouter } from "next/router";
import { useLoggedIn } from "../../data/hooks/authentication";
import dynamic from "next/dynamic";
import { useOwner } from "../../data/hooks/owner/get";

export default function Header() {
  const router = useRouter();
  const activeRoute = router.pathname;

  const { data: owner } = useOwner();
  const authenticated = useLoggedIn();

  return <HeaderStateless authenticated={authenticated} activeRoute={activeRoute} ownerName={owner?.name || ""} />;
}

export const HeaderStateless = function ({ ownerName, activeRoute, authenticated }) {
  const DropdownHeader = dynamic(() =>
    import("semantic-ui-react/dist/commonjs/modules/Dropdown").then((dd) => dd.Header)
  );
  const DropdownDivider = dynamic(() =>
    import("semantic-ui-react/dist/commonjs/modules/Dropdown").then((dd) => dd.Divider)
  );
  const HeaderMenuDropdownItem = dynamic(() => import("./header-menu-dropdown-item"));
  const LogoutButton = dynamic(() => import("./logout-button"));
  const HeaderSearch = dynamic(() => import("./header-search"));

  return (
    <Menu secondary pointing>
      <HeaderOwner />
      <HeaderMenuItem exact active={activeRoute} title={"About"} href={"/"} />
      <HeaderMenuItem active={activeRoute} title={"Projects"} href={"/projects"} />
      <HeaderMenuItem active={activeRoute} title={"Blog"} href={"/blog/articles"} />
      {authenticated && (
        <HeaderMenuDropdownItem title={"Admin"}>
          <HeaderMenuItem active={activeRoute} title={"Bio"} href={"/admin/bio"} />
          <HeaderMenuItem active={activeRoute} title={"Projects"} href={"/admin/projects"} />
          <HeaderMenuItem active={activeRoute} title={"Blog"} href={"/admin/blog/articles"} />
          <HeaderMenuItem active={activeRoute} title={"Images"} href={"/admin/images"} />
          <HeaderMenuItem active={activeRoute} title={"Footer"} href={"/admin/footer"} />
        </HeaderMenuDropdownItem>
      )}
      <Menu.Menu position="right">
        <HeaderSearch />
        {authenticated && (
          <HeaderMenuDropdownItem icon={"user"}>
            <DropdownHeader content={ownerName} />
            <DropdownDivider />
            <HeaderMenuItem active={activeRoute} title={"Account"} icon={"settings"} href={"/admin/account"} />
            <LogoutButton />
          </HeaderMenuDropdownItem>
        )}
      </Menu.Menu>
    </Menu>
  );
};
