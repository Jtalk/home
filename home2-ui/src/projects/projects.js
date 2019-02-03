import React from "react";
import ProjectsMenu from "./projects-menu";
import ProjectDescription from "./project-description";

export default class Projects extends React.Component {

    render() {
        return <div>
            <ProjectsMenu projects={this.props.projects} selectedProjectId={this.props.selectedProjectId}/>
            <ProjectDescription {...this.props.selectedProject}/>
        </div>
    }
}