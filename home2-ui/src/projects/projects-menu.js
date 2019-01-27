import React from "react";
import "../bbcode/tags";
import {Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";

export default class ProjectsMenu extends React.Component {

    render() {
        return <Menu tabular layout="block">
            {this.props.projects.map(this.projectTab.bind(this))}
        </Menu>
    }

    projectTab(project) {
        if (project.id === this.props.selectedProjectId) {
            return <div key={project.id} className="active item">{project.title}</div>
        } else {
            return <Link key={project.id} className="item" to={project.href}>{project.title}</Link>
        }
    }
}