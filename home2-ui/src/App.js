import React, {Component} from 'react';
import './App.css';
import Header from './header/header';
import About from "./home/about";
import {Container} from "semantic-ui-react";
import Footer from "./footer/footer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Blog from "./blog/blog";
import Projects from "./projects/projects";
import EditBio from "./admin/edit-bio";
import EditProjects from "./admin/edit-projects";
import EditFooter from "./admin/edit-footer";
import EditBlogRouter from "./admin/edit-blog-router";
import EditImages from "./admin/edit-images";
import NotFound from "./error/not-found";

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ownerName: "Vasya Pupkin"
        };
    }

    render() {
        document.title = this.state.ownerName;
        return <div className="main-content-pushable">
            <Container className="main-content-pusher framed">
                <Router>
                    <Switch>
                        {this._buildRoutes(this._mainRoutes().concat(this._serviceRoutes()))}
                    </Switch>
                </Router>
            </Container>
            <Footer/>
        </div>
    }

    _buildRoutes(routes) {
        return routes.flatMap(route => {
            if (Array.isArray(route.routes) && route.routes.length) {
                return this._buildRoutes(route.routes)
            } else {
                return [<Route key={route.title} render={params => this.page(route.title, route.renderer(params))} {...route}/>]
            }
        });
    }

    _mainRoutes() {
        return [
            {title: "About", path: "/", renderer: () => <About ownerName={this.state.ownerName}/>, exact: true},
            {title: "Projects", path: "/projects", renderer: () => <Projects ownerName={this.state.ownerName}/>},
            {title: "Blog", path: "/blog/articles", renderer: () => <Blog ownerName={this.state.ownerName}/>},
            {
                title: "Admin", routes: [
                    {
                        title: "Edit Bio",
                        path: "/admin/bio",
                        exact: true,
                        renderer: () => <EditBio ownerName={this.state.ownerName}/>
                    },
                    {
                        title: "Edit Projects",
                        path: "/admin/projects/:projectId?",
                        exact: true,
                        renderer: params => <EditProjects currentProjectId={params.match.params.projectId}
                                                                                 ownerName={this.state.ownerName}/>,
                    },
                    {
                        title: "Edit Blog",
                        path: "/admin/blog/articles/:articleId?",
                        exact: true,
                        renderer: params => <EditBlogRouter ownerName={this.state.ownerName} articleId={params.match.params.articleId}/>,
                    },
                    {
                        title: "Edit Images",
                        path: "/admin/images/:idx?",
                        exact: true,
                        renderer: params => <EditImages currentPageIdx={params.match.params.idx}
                                                                                ownerName={this.state.ownerName}/>,
                    },
                    {
                        title: "Edit Footer",
                        path: "/admin/footer",
                        exact: true,
                        renderer: () => <EditFooter ownerName={this.state.ownerName}/>
                    }
                ]
            },
        ]
    }

    _serviceRoutes() {
        return [
            { title: "Error 404", component: params => this.error(params.match.location) },
        ]
    }

    error(location) {
        return this.page(null, <NotFound location={location}/>);
    }

    page(activeLink, mainComponent) {
        return <div>
            <Header ownerName="Vasya Pupkin" activeLink={activeLink} links={this._mainRoutes()}/>
            {mainComponent}
        </div>
    }
}

