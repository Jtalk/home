import React from "react";
import {About} from "../home/about";
import {ProjectsRouter} from "../projects/projects-router";
import {EditBio} from "../admin/edit-bio";
import {EditProjectsRouter} from "../admin/edit-projects";
import {EditBlogRouter} from "../admin/edit-blog-router";
import {EditImagesRouter} from "../admin/edit-images";
import {EditFooter} from "../admin/edit-footer";
import {NotFound} from "../error/not-found";
import {Switch} from "react-router-dom";
import {Header, LogoutButton} from "../header/header";
import {NavigationDropdown, NavigationRoute, PartialRoute, PartialSwitch} from "./route";
import {RenderMode, RenderModeProvider, useRenderMode} from "./render-context";
import {BlogRouter} from "../blog/blog-router";
import {Dropdown, Menu} from "semantic-ui-react";
import {HeaderSearch} from "../header/header-search";
import {useOwner} from "../data/reduce/owner";
import {EditAccount} from "../admin/edit-account";
import {ActiveRouteProvider, useActiveRoute} from "./active-route-context";

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
                {/*<MenuOnly path="/noroute">*/}
                {/*    <HeaderSearch/>*/}
                {/*</MenuOnly>*/}
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