import {EditProjects} from "../../../component/admin/edit-projects";
import React from "react";
import {OwnerTitled} from "../../../component/about/owner-titled";
import {useReducers} from "../../../data/redux-dynamic";
import authenticationReducer from "../../../data/reduce/authentication";
import searchReducer from "../../../data/reduce/search";
import footerReducer from "../../../data/reduce/footer";
import projectsReducer from "../../../data/reduce/articles";

export default function Projects() {
    
    useReducers(authenticationReducer, searchReducer, footerReducer, projectsReducer);

    return <>
        <OwnerTitled title={"Edit Projects"}/>
        <EditProjects/>
    </>
}
