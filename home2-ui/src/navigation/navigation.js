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
import {Header} from "../header/header";
import {NavigationDropdown, NavigationRoute, RouteOnly} from "./route";
import {RenderMode, RenderModeProvider, useRenderMode} from "./render-context";
import {BlogRouter} from "../blog/blog-router";

export const Navigation = function ({renderMode}) {
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
            <RouteOnly>
                <NotFound/>
            </RouteOnly>
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
            return <Switch children={children}/>;
        default:
            throw Error(`Unsupported render mode ${renderMode}`);
    }
};
