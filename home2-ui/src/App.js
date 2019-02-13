import React, {Component} from 'react';
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
import FooterLoader from "./footer/footer-loader";
import "./utils/config";
import * as request from "superagent";
import api from "./utils/superagent-api";
import {apiDelay} from "./utils/test-api-delay";
import {Titled} from "react-titled";

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ownerName: ""
        };
    }

    render() {
        return <div className="main-content-pushable">
            <Container className="main-content-pusher framed">
                <Titled title={() => this.state.ownerName}>
                    <Router>
                        <Switch>
                            {this._buildRoutes(this._mainRoutes().concat(this._serviceRoutes()))}
                        </Switch>
                    </Router>
                </Titled>
            </Container>
            <FooterLoader/>
        </div>
    }

    async componentDidMount() {
        let response = await request.get("/owner/name")
            .use(api);
        await apiDelay();
        this.setState({ownerName: response.text});
    }

    _buildRoutes(navigation) {
        return navigation.flatMap(navigationLink => {
            return createRoutes(navigationLink.route);
        });
    }

    _mainRoutes() {
        return [
            this._createNavigation("About", "/", () => <About ownerName={this.state.ownerName}/>, true),
            this._createNavigation("Projects", "/projects", () => <ProjectsLoader ownerName={this.state.ownerName}/>, false),
            this._createNavigation("Blog", "/blog/articles", () => <Blog ownerName={this.state.ownerName}/>, false),
            this._createNestedNavigation("Admin", [
                this._createNavigation(
                    "Edit Bio",
                    "/admin/bio",
                    () => <EditBio ownerName={this.state.ownerName}/>,
                    true),
                this._createComplexNavigation(
                    "Edit Projects",
                    "/admin/projects",
                    "/admin/projects/:projectId?",
                    params => <EditProjects currentProjectId={params.match.params.projectId}
                                            ownerName={this.state.ownerName}/>,
                    true),
                this._createComplexNavigation(
                    "Edit Blog",
                    "/admin/blog/articles",
                    "/admin/blog/articles/:articleId?",
                    params => <EditBlogRouter ownerName={this.state.ownerName}
                                              articleId={params.match.params.articleId}/>,
                    true),
                this._createComplexNavigation(
                    "Edit Images",
                    "/admin/images",
                    "/admin/images/:idx?",
                    params => <EditImages currentPageIdx={params.match.params.idx} ownerName={this.state.ownerName}/>,
                    true),
                this._createNavigation(
                    "Edit Footer",
                    "/admin/footer",
                    () => <EditFooter ownerName={this.state.ownerName}/>,
                    true)
            ])
        ]
    }

    _serviceRoutes() {
        return [
            {route: createRoutingConfig("Error 404", params => this._error(params.match.location))},
        ]
    }

    _createNavigation(title, href, renderer, exact) {
        return this._createComplexNavigation(title, href, href, renderer, exact);
    }

    _createComplexNavigation(title, href, routePath, renderer, exact) {
        let render = params => this._page(title, renderer(params));
        return {
            menu: Header.buildLink(title, href),
            route: createRoutingConfig(routePath, render, exact)
        };
    }

    _createNestedNavigation(title, navigations) {
        let submenu = navigations.map(n => n.menu);
        let routes = navigations.map(n => n.route);
        return {
            menu: Header.buildSubmenuLinks(title, submenu),
            route: createMultiRoutingConfig(routes)
        };
    }

    _error(location) {
        return this._page(null, <NotFound location={location}/>);
    }

    _page(activeLink, mainComponent) {
        return <div>
            <Header ownerName={this.state.ownerName} activeLink={activeLink} links={this._mainRoutes().map(r => r.menu)}/>
            {mainComponent}
        </div>
    }
}

