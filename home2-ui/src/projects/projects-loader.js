import React from "react";
import "../bbcode/tags";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import * as assert from "assert";
import Projects from "./projects";
import NotFound from "../error/not-found";

export default class ProjectsLoader extends React.Component {

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
                    links: [{name: "BitBucket", href: "/example"}, {name: "Github", href: "/example"}]
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
                    let selectedProject = this._getSelectedProject(selectedProjectId);
                    assert(!!selectedProject, "No project was selected");
                    return <Projects selectedProjectId={selectedProjectId} />
                }}/>
                <Route render={() => <NotFound/>}/>
            </Switch>
        </Router>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Projects";
    }

    _getSelectedProject(selectedProjectId) {
        return this.currentProject = this.state.projects.find(p => p.id === selectedProjectId);
    }
}