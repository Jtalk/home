import React from "react";
import {About} from "../page/about/about";
import {ProjectsRouter} from "../page/projects/projects-router";
import {EditBio} from "../page/admin/edit-bio";
import {EditProjectsRouter} from "../page/admin/edit-projects";
import {EditBlogRouter} from "../page/admin/edit-blog-router";
import {EditImagesRouter} from "../page/admin/edit-images";
import {EditFooter} from "../page/admin/edit-footer";
import {NotFound} from "../page/error/not-found";
import {Redirect, Switch} from "react-router-dom";
import {Header, LogoutButton} from "../component/header/header";
import {NavigationDropdown, NavigationRoute, PartialRoute, PartialSwitch} from "./route";
import {RenderMode, RenderModeProvider, useRenderMode} from "./render-context";
import {BlogRouter} from "../page/blog/blog-router";
import {Dropdown, Menu} from "semantic-ui-react";
import {useOwner} from "../data/reduce/owner";
import {EditAccount} from "../page/admin/edit-account";
import {ActiveRouteProvider, routeConcat, useActiveRoute} from "./active-route-context";
import {useQueryParam} from "./query";
import {HeaderSearch} from "../component/header/header-search";

export const Navigation = function ({renderMode}) {
    let {name} = useOwner();
    return <RenderModeProvider renderMode={renderMode}>
        <NavigationHeader>
            <NavigationRoute exact title="About" path="/">
                <About/>
            </NavigationRoute>
            <NavigationRoute title="Projects" path="/projects">
                <ProjectsRouter/>
            </NavigationRoute>
            <NavigationRoute title="Blog" path="/blog/articles">
                <BlogRouter/>
            </NavigationRoute>
            <LegacyRedirect exact from="/home" to="/"/>
            <LegacyRedirect from="/home/projects.xhtml" to="/projects" parameterName="project"/>
            <LegacyRedirect from="/home/blog/post.xhtml" to="/blog/articles" parameterName="name"/>
            <NavigationDropdown authenticated title="Admin" path="/admin">
                <NavigationRoute authenticated exact title="Edit Bio" path="/bio">
                    <EditBio/>
                </NavigationRoute>
                <NavigationRoute authenticated title="Edit Projects" path="/projects">
                    <EditProjectsRouter/>
                </NavigationRoute>
                <NavigationRoute authenticated title="Edit Blog" path="/blog/articles">
                    <EditBlogRouter/>
                </NavigationRoute>
                <NavigationRoute authenticated title="Edit Images" path="/images">
                    <EditImagesRouter/>
                </NavigationRoute>
                <NavigationRoute authenticated exact title="Edit Footer" path="/footer">
                    <EditFooter/>
                </NavigationRoute>
            </NavigationDropdown>
            <NavigationRight path="/user">
                <MenuOnly path="/noroute">
                    <HeaderSearch/>
                </MenuOnly>
                <NavigationDropdown authenticated icon="user" path="/">
                    <MenuOnly path="/noroute">
                        <Dropdown.Header content={name}/>
                        <Dropdown.Divider/>
                    </MenuOnly>
                    <NavigationRoute exact title="Account" icon="settings" path="/account">
                        <EditAccount/>
                    </NavigationRoute>
                    <MenuOnly path="/noroute">
                        <LogoutButton/>
                    </MenuOnly>
                </NavigationDropdown>
            </NavigationRight>
        </NavigationHeader>
    </RenderModeProvider>
};

const NavigationHeader = function ({children}) {
    let renderMode = useRenderMode();
    switch (renderMode) {
        case RenderMode.MENU:
            return <Header>
                {children}
            </Header>;
        case RenderMode.ROUTER:
            return <Switch>
                {children}
                <NotFound/>
            </Switch>;
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};

const NavigationRight = function ({children, path}) {
    let renderMode = useRenderMode();
    let routeSoFar = useActiveRoute(path);
    switch (renderMode) {
        case RenderMode.MENU:
            return <ActiveRouteProvider routeSoFar={routeSoFar}>
                <Menu.Menu position="right">
                    {children}
                </Menu.Menu>
            </ActiveRouteProvider>;
        case RenderMode.ROUTER:
            // Just keep rendering routes
            return <PartialRoute path={path}>
                <PartialSwitch path="/">
                    {children}
                    <NotFound/>
                </PartialSwitch>
            </PartialRoute>
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};

const MenuOnly = function ({children}) {
    let renderMode = useRenderMode();
    switch (renderMode) {
        case RenderMode.MENU:
            return children;
        case RenderMode.ROUTER:
            return <NotFound/>;
        default:
            throw Error(`Unsupported render mode ${renderMode && renderMode.description}`);
    }
};

const LegacyRedirect = function ({from, to, parameterName=""}) {
    let renderMode = useRenderMode();
    let id = useQueryParam(parameterName, "");
    if (renderMode !== RenderMode.ROUTER) {
        return null;
    }
    if (typeof to === "string") {
        to = routeConcat(to, id);
    } else if (typeof to === "function") {
        to = to(id);
    } else {
        throw Error("Unsupported 'to' parameter for LegacyRedirect");
    }
    console.info(`Redirecting from a legacy endpoint ${from}, redirecting to the new one: ${to}`);
    return <Redirect from={from} to={to}/>
}