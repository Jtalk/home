import {projectActions, useProjectLoading, useProjects} from "../../data/reduce/projects";
import {Loading} from "../../data/reduce/global/enums";
import {ProjectsMenu} from "../../component/projects/projects-menu";
import {ProjectDescription} from "../../component/projects/project-description";
import React from "react";
import {useRouter} from "next/router";
import {NotFound} from "../../component/error/not-found";
import {reduxWrapper} from "../../data/redux";
import {ownerActions} from "../../data/reduce/owner";
import {footerActions} from "../../data/reduce/footer";
import {Titled} from "react-titled";
import find from "lodash/find";

export default function Project() {
    let router = useRouter();
    let {projectId} = router.query;

    let projects = useProjects();
    let loading = useProjectLoading();
    let selectedProject = find(projects, p => p.id === projectId);

    if (projects?.length && loading !== Loading.LOADING && !selectedProject) {
        return <NotFound/>
    }
    selectedProject = selectedProject || projects[0] || {};

    return <div>
        <Titled title={t => "Projects | " + t}/>
        <ProjectsMenu projects={projects} selectedProjectId={projectId}/>
        <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject}/>
    </div>
}

export const getServerSideProps = reduxWrapper.getServerSideProps(async ({store}) => {
    await Promise.all([
        store.dispatch(ownerActions.load()), // for menubar
        store.dispatch(projectActions.load()),
        store.dispatch(footerActions.load()),
    ])
    return {props: {}}
})
