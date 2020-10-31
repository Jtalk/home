import {useRouter} from "next/router";
import {EditProjects} from "../../../component/admin/edit-projects";
import React from "react";
import {OwnerTitled} from "../../../component/about/owner-titled";
import {useReducers} from "../../../data/redux-dynamic";
import ownerReducer from "../../../data/reduce/owner";
import latestArticlesReducer from "../../../data/reduce/latest-articles";
import authenticationReducer from "../../../data/reduce/authentication";
import searchReducer from "../../../data/reduce/search";
import footerReducer from "../../../data/reduce/footer";
import projectsReducer from "../../../data/reduce/articles";

export default function EditProject() {

    useReducers(authenticationReducer, searchReducer, footerReducer, projectsReducer);

    const router = useRouter();
    const {projectId} = router.query;

    return <>
        <OwnerTitled title={"Edit Projects"}/>
        <EditProjects currentProjectId={projectId}/>
    </>
}
