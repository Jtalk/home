import React from "react";
import {ProjectsMenu} from "./projects-menu";
import {ProjectDescription} from "./project-description";
import {useProjects} from "../data/reduce/projects";
import _ from "lodash";

export const Projects = function ({selectedProjectId}) {

    let projects = useProjects();
    let selectedProject = _.find(projects, p => p.id === selectedProjectId) || projects[0];

    return <div>
        <ProjectsMenu projects={projects} selectedProjectId={selectedProjectId}/>
        {selectedProject && <ProjectDescription {...selectedProject}/>}
    </div>
};