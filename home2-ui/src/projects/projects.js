import React from "react";
import {ProjectsMenu} from "./projects-menu";
import {ProjectDescription} from "./project-description";
import {useProjectLoading, useProjects} from "../data/reduce/projects";
import _ from "lodash";
import {Loading} from "../data/reduce/global/enums";
import {NotFound} from "../error/not-found";

export const Projects = function ({selectedProjectId}) {

    let projects = useProjects();
    let loading = useProjectLoading();
    let selectedProject = _.find(projects, p => p.id === selectedProjectId);

    if (projects && projects.length && loading !== Loading.LOADING && selectedProjectId && !selectedProject) {
        return <NotFound/>
    }
    selectedProject = selectedProject || projects[0] || {};

    return <div>
        <ProjectsMenu projects={projects} selectedProjectId={selectedProjectId}/>
        {selectedProject && <ProjectDescription {...selectedProject}/>}
    </div>
};