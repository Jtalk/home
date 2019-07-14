import React from 'react';
import './App.css';
import Header from './header/header';
import About from "./home/about";
import {Container} from "semantic-ui-react";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import Blog from "./blog/blog";
import EditBio from "./admin/edit-bio";
import EditProjects from "./admin/edit-projects";
import EditFooter from "./admin/edit-footer";
import EditBlogRouter from "./admin/edit-blog-router";
import EditImages from "./admin/edit-images";
import NotFound from "./error/not-found";
import {createMultiRoutingConfig, createRoutes, createRoutingConfig} from "./utils/routing";
import ProjectsLoader from "./projects/projects-loader";
import {Footer} from "./footer/footer";
import "./utils/config";
import {Titled} from "react-titled";
import * as owner from "./data/reduce/owner";
import {AjaxProvider, useAjaxLoader} from "./context/ajax-context";
import {useImmutableSelector} from "./utils/redux-store";

export const App = function () {
    let ownerName = useImmutableSelector("owner", ["data", "name"]);
    useAjaxLoader(owner.load);
    return <AjaxProvider>
        <div className="main-content-pushable">
            <Container className="main-content-pusher framed">
                <Titled title={() => ownerName}>
                    <Router>
                        <Switch>
                            {buildRoutes(mainRoutes().concat(serviceRoutes()))}
                        </Switch>
                    </Router>
                </Titled>
            </Container>
            <Footer/>
        </div>
    </AjaxProvider>
};

function buildRoutes(navigation) {
    return navigation.flatMap(navigationLink => {
        return createRoutes(navigationLink.route);
    });
}

function mainRoutes(ownerName) {
    return [
        createNavigation("About", "/", () => <About ownerName={ownerName}/>, true),
        createNavigation("Projects", "/projects", () => <ProjectsLoader
            ownerName={ownerName}/>, false),
        createNavigation("Blog", "/blog/articles", () => <Blog ownerName={ownerName}/>, false),
        createNestedNavigation("Admin", [
            createNavigation(
                "Edit Bio",
                "/admin/bio",
                () => <EditBio ownerName={ownerName}/>,
                true),
            createComplexNavigation(
                "Edit Projects",
                "/admin/projects",
                "/admin/projects/:projectId?",
                params => <EditProjects currentProjectId={params.match.params.projectId}
                                        ownerName={ownerName}/>,
                true),
            createComplexNavigation(
                "Edit Blog",
                "/admin/blog/articles",
                "/admin/blog/articles/:articleId?",
                params => <EditBlogRouter ownerName={ownerName}
                                          articleId={params.match.params.articleId}/>,
                true),
            createComplexNavigation(
                "Edit Images",
                "/admin/images",
                "/admin/images/:idx?",
                params => <EditImages currentPageIdx={params.match.params.idx} ownerName={ownerName}/>,
                true),
            createNavigation(
                "Edit Footer",
                "/admin/footer",
                () => <EditFooter ownerName={ownerName}/>,
                true)
        ])
    ]
}

function serviceRoutes() {
    return [
        {route: createRoutingConfig("Error 404", params => error(params.match.location))},
    ]
}

function createNavigation(title, href, renderer, exact) {
    return createComplexNavigation(title, href, href, renderer, exact);
}

function createComplexNavigation(title, href, routePath, renderer, exact) {
    let render = params => page(title, renderer(params));
    return {
        menu: Header.buildLink(title, href),
        route: createRoutingConfig(routePath, render, exact)
    };
}

function createNestedNavigation(title, navigations) {
    let submenu = navigations.map(n => n.menu);
    let routes = navigations.map(n => n.route);
    return {
        menu: Header.buildSubmenuLinks(title, submenu),
        route: createMultiRoutingConfig(routes)
    };
}

function error(location) {
    return page(null, <NotFound location={location}/>);
}

function page(ownerName, activeLink, mainComponent) {
    return <div>
        <Header ownerName={ownerName} activeLink={activeLink} links={mainRoutes().map(r => r.menu)}/>
        {mainComponent}
    </div>
}