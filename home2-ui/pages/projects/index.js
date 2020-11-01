import React from "react";
import {ProjectsMenu} from "../../component/projects/menu/projects-menu";
import {ProjectDescription} from "../../component/projects/project-description";
import {useProjectLoading, useProjects} from "../../data/reduce/projects";
import {Loading} from "../../data/reduce/global/enums";
import {reduxWrapper} from "../../data/redux";
import {OwnerTitled} from "../../component/about/owner-titled";

export default function Projects() {

    let projects = useProjects();
    let loading = useProjectLoading();
    let selectedProject = projects[0] || {};

    return <div>
        <OwnerTitled title={"Projects"}/>
        <ProjectsMenu projects={projects}/>
        <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject}/>
    </div>
};

export const getServerSideProps = reduxWrapper.getServerSideProps(async ({store}) => {
    return {props: {}}
})
