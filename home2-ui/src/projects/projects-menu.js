import React from "react";
import {Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";

export const ProjectsMenu = function ({projects = [], selectedProjectId}) {

    return <Menu tabular layout="block">
        {projects.map((p, i) => {
            let isSelectedId = selectedProjectId && p.id === selectedProjectId;
            let noneSelectedMeansFirst = !selectedProjectId && i === 0;
            return <ProjectTab key={p.id}
                               project={p}
                               active={isSelectedId || noneSelectedMeansFirst}/>
        })}
    </Menu>
};

export const ProjectTab = function ({project, active}) {
    if (active) {
        return <div className="active item">{project.title}</div>
    } else {
        return <Link className="item" to={`/projects/${project.id}`}>{project.title}</Link>
    }
};
