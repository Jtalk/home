import React from "react";
import {Menu} from "semantic-ui-react";
import {ProjectTab} from "./projects-menu-tab";

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

