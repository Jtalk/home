import React from "react";
import {ProjectsMenu} from "./projects-menu";
import {ProjectDescription} from "./project-description";
import {useAjaxLoader} from "../context/ajax-context";
import {load} from "../data/reduce/projects";
import {useImmutableSelector} from "../utils/redux-store";
import _ from "lodash";

export const Projects = function ({selectedProjectId}) {

    useAjaxLoader(load);

    let projects = useImmutableSelector("projects", "data");
    let selectedProject = _.find(projects, p => p.id === selectedProjectId) || projects[0];

    return <div>
        <ProjectsMenu projects={projects} selectedProjectId={selectedProjectId}/>
        {selectedProject && <ProjectDescription {...selectedProject}/>}
    </div>
};