import React from "react";
import "../bbcode/tags";
import {BrowserRouter as Router, Route, Redirect, Switch} from "react-router-dom";
import ProjectsMenu from "./projects-menu";
import ProjectDescription from "./project-description";
import WebError from "../error/web-error";
import * as assert from "assert";

export default class Projects extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            projects: [
                {
                    title: "Project 1",
                    id: "project-1",
                    href: "/projects/project-1",
                    logo: "/images/avatar.png",
                    description: "[h1]Header 1 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                        " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                        " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                        " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                        " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                    links: []
                },
                {
                    title: "Project 2",
                    id: "project-2",
                    href: "/projects/project-2",
                    logo: "/images/avatar.png",
                    description: "[h1]Header 2 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                        " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                        " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                        " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                        " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                    links: []
                }
            ]
        };
    }

    render() {
        return <Router>
            <Switch>
                <Redirect exact from="/projects" to={this.state.projects[0].href}/>
                <Route exact path="/projects/:projectId" render={params => {
                    let selectedProjectId = params.match.params.projectId;
                    let selectedProject = this.getSelectedProject(selectedProjectId);
                    assert(!!selectedProject, "No project was selected");
                    return <div>
                        <ProjectsMenu projects={this.state.projects} selectedProjectId={selectedProjectId}/>
                        <ProjectDescription {...selectedProject}/>
                    </div>
                }}/>
                <Route render={() => <WebError httpCode={404} message="Not Found"/>}/>
            </Switch>
        </Router>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Projects";
    }

    getSelectedProject(selectedProjectId) {
        return this.currentProject = this.state.projects.find(p => p.id === selectedProjectId);
    }
}