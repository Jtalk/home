import React from "react";
import {Menu} from "semantic-ui-react";
import Link from "next/link";
import {PathPrefix} from "../../pages/projects";

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
        return <Link shallow href={`${PathPrefix}/${project.id}`}>
            <a className="item">{project.title}</a>
        </Link>
    }
};
