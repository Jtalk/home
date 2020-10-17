import React from "react";
import {ProjectsMenu} from "../../component/projects/projects-menu";
import {ProjectDescription} from "../../component/projects/project-description";
import {useProjectLoading, useProjects} from "../../data/reduce/projects";
import {Loading} from "../../data/reduce/global/enums";

export const PathPrefix = "/projects";

export default function Projects() {

    let projects = useProjects();
    let loading = useProjectLoading();
    let selectedProject = projects[0] || {};

    return <div>
        <ProjectsMenu projects={projects}/>
        <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject}/>
    </div>
};
