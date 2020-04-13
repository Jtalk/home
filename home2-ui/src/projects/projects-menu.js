import React from "react";
import {Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";

export const ProjectsMenu = function ({projects = [], selectedProjectId}) {

    return <Menu tabular layout="block">
        {projects.map((p, i) => <ProjectTab key={p.id} project={p} active={(selectedProjectId && p.id === selectedProjectId) || (!selectedProjectId && i === 0)}/>)}
    </Menu>
};

export const ProjectTab = function ({project, active}) {
    if (active) {
        return <div className="active item">{project.title}</div>
    } else {
        return <Link className="item" to={`/projects/${project.id}`}>{project.title}</Link>
    }
};
