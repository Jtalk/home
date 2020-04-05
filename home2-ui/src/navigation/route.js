import {Route, Switch, useLocation} from "react-router-dom";
import React from "react";
import {HeaderMenuItem} from "../header/header-menu-item";
import {ActiveRouteProvider, useActiveRoute, useCurrentRouteMatch} from "./active-route-context";
import {RenderMode, useRenderMode} from "./render-context";
import {HeaderMenuDropdownItem} from "../header/header-menu-dropdown-item";
import {useLoggedIn} from "../data/reduce/authentication";

export const PartialRoute = function (props) {
    let currentRoute = useActiveRoute(props.path);
    let newProps = Object.assign({}, props, {path: currentRoute});
    return <ActiveRouteProvider routeSoFar={newProps.path}>
        <Route {...newProps}/>
    </ActiveRouteProvider>
};

export const NavigationRoute = function (props) {
    return <ComplexRoute {...props} href={props.path}/>
};

export const ComplexRoute = function ({exact, title, href, path, authenticated, children}) {
    let renderMode = useRenderMode();
    let fullHref = useActiveRoute(href);
    let fullPath = useActiveRoute(path);
    let active = useCurrentRouteMatch(fullPath, exact);
    let isLoggedIn = useLoggedIn();
    if (authenticated && !isLoggedIn) {
        // Skip authorised-only endpoints altogether.
        return null;
    }
    switch (renderMode) {
        case RenderMode.MENU:
            return <HeaderMenuItem active={active} title={title} href={fullHref}/>;
        case RenderMode.ROUTER:
            return <PartialRoute exact={exact} path={path}>
                {children}
            </PartialRoute>;
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};

export const NavigationDropdown = function ({title, path, authenticated, children}) {
    let renderMode = useRenderMode();
    let routeSoFar = useActiveRoute(path);
    let loggedIn = useLoggedIn();
    if (authenticated && !loggedIn) {
        // Skip authorised-only endpoints altogether.
        return null;
    }
    switch (renderMode) {
        case RenderMode.MENU:
            return <ActiveRouteProvider routeSoFar={routeSoFar}>
                <HeaderMenuDropdownItem title={title}>
                    {children}
                </HeaderMenuDropdownItem>
            </ActiveRouteProvider>;
        case RenderMode.ROUTER:
            return <PartialRoute path={path}>
                {/*It's / because this partial switch doesn't contribute toward any PART of the actual route*/}
                <PartialSwitch path="/">
                    {children}
                </PartialSwitch>
            </PartialRoute>;
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};

export const PartialSwitch = function ({path, children}) {

    let routeSoFar = useActiveRoute(path);
    let location = useLocation();

    let subpath = dropPathPrefix(location.pathname, routeSoFar);
    let sublocation = Object.assign({}, location, {pathname: subpath});
    return <Switch location={sublocation}>
        {children}
    </Switch>
};

export const RouteOnly = function (props) {
    let renderMode = useRenderMode();
    switch (renderMode) {
        case RenderMode.MENU:
            return null;
        case RenderMode.ROUTER:
            return <PartialRoute {...props}/>;
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};

function dropPathPrefix(path, prefix) {
    if (!path.startsWith(prefix)) {
        return path;
    }
    if (path.length === prefix.length) {
        return "/";
    }
    if (!prefix.endsWith("/") && path[prefix.length] !== "/") {
        // We only split by /, we don't want /adminhub/something to match /admin
        return path;
    }
    let result = path.substring(prefix.length);
    if (!result.startsWith("/")) {
        result = "/" + result;
    }
    return result;
}