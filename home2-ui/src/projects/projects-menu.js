import React from "react";
import "../bbcode/tags";
import {Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";

export const ProjectsMenu = function ({projects, selectedProjectId}) {

    return <Menu tabular layout="block">
        {projects.map(p => <ProjectTab key={p.id} project={p} selectedProjectId={selectedProjectId}/>)}
    </Menu>
};

export const ProjectTab = function ({project, selectedProjectId}) {
    if (project.id === selectedProjectId) {
        return <div className="active item">{project.title}</div>
    } else {
        return <Link className="item" to={`/projects/${project.id}`}>{project.title}</Link>
    }
};
