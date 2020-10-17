import {useProjectLoading, useProjects} from "../../data/reduce/projects";
import {Loading} from "../../data/reduce/global/enums";
import {ProjectsMenu} from "../../component/projects/projects-menu";
import {ProjectDescription} from "../../component/projects/project-description";
import React from "react";
import * as _ from "lodash";
import {useRouter} from "next/router";
import {NotFound} from "../../component/error/not-found";

export default function Project() {
    let router = useRouter();
    let {projectId} = router.query;

    let projects = useProjects();
    let loading = useProjectLoading();
    let selectedProject = _.find(projects, p => p.id === projectId);

    if (projects?.length && loading !== Loading.LOADING && !selectedProject) {
        return <NotFound/>
    }
    selectedProject = selectedProject || projects[0] || {};

    return <div>
        <ProjectsMenu projects={projects} selectedProjectId={projectId}/>
        <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject}/>
    </div>
}
