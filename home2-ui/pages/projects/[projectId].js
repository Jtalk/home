import {projectActions, useProjectLoading, useProjects} from "../../data/reduce/projects";
import {Loading} from "../../data/reduce/global/enums";
import {ProjectsMenu} from "../../component/projects/menu/projects-menu";
import {ProjectDescription} from "../../component/projects/project-description";
import React from "react";
import {useRouter} from "next/router";
import {NotFound} from "../../component/error/not-found";
import {reduxWrapper} from "../../data/redux";
import ownerReducer, {ownerActions} from "../../data/reduce/owner";
import find from "lodash/find";
import {OwnerTitled} from "../../component/about/owner-titled";
import {footerActions} from "../../data/reduce/footer/actions";
import {useReducers} from "../../data/redux-dynamic";
import latestArticlesReducer from "../../data/reduce/latest-articles";
import authenticationReducer from "../../data/reduce/authentication";
import searchReducer from "../../data/reduce/search";
import footerReducer from "../../data/reduce/footer";
import projectsReducer from "../../data/reduce/projects";

export default function Project() {

    useReducers(ownerReducer, latestArticlesReducer, authenticationReducer, searchReducer, footerReducer, projectsReducer);

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
        <OwnerTitled title={"Projects"}/>
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
