import React from "react";
import {HeaderOwner} from "./header-owner";
import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {useLoggedIn, useLogoutHandler} from "../../data/reduce/authentication";
import {HeaderMenuItem} from "./header-menu-item";
import {useRouter} from "next/router";
import {HeaderSearch} from "./header-search";
import {HeaderMenuDropdownItem} from "./header-menu-dropdown-item";
import {useOwner} from "../../data/reduce/owner";

export const Header = function () {
    const router = useRouter();
    const activeRoute = router.pathname;

    const owner = useOwner();
    const authenticated = useLoggedIn();

    return <HeaderStateless authenticated={authenticated} activeRoute={activeRoute} ownerName={owner?.name || ""}/>
};

export const HeaderStateless = function ({ownerName, activeRoute, authenticated}) {

    return <Menu secondary pointing>
        <HeaderOwner/>
        <HeaderMenuItem exact active={activeRoute} title={"About"} href={"/"}/>
        <HeaderMenuItem active={activeRoute} title={"Projects"} href={"/projects"}/>
        <HeaderMenuItem active={activeRoute} title={"Blog"} href={"/blog/articles"}/>
        {authenticated && <HeaderMenuDropdownItem title={"Admin"}>
            <HeaderMenuItem active={activeRoute} title={"Bio"} href={"/admin/bio"}/>
            <HeaderMenuItem active={activeRoute} title={"Projects"} href={"/admin/projects"}/>
            <HeaderMenuItem active={activeRoute} title={"Blog"} href={"/admin/blog/articles"}/>
            <HeaderMenuItem active={activeRoute} title={"Images"} href={"/admin/images"}/>
            <HeaderMenuItem active={activeRoute} title={"Footer"} href={"/admin/footer"}/>
        </HeaderMenuDropdownItem>}
        <Menu.Menu position="right">
            <HeaderSearch/>
            {authenticated && <HeaderMenuDropdownItem icon={"user"}>
                <Dropdown.Header content={ownerName}/>
                <Dropdown.Divider/>
                <HeaderMenuItem active={activeRoute} title={"Account"} icon={"settings"} href={"/admin/account"}/>
                <LogoutButton/>
            </HeaderMenuDropdownItem>}
        </Menu.Menu>
    </Menu>
};

export const LogoutButton = function () {
    let loggedIn = useLoggedIn();
    let logoutHandler = useLogoutHandler();
    let onClick = () => {
        loggedIn && logoutHandler();
    };
    return <Menu.Item onClick={onClick} tooltip="Logout">
        <Icon name="sign-out"/>Sign out
    </Menu.Item>
};
