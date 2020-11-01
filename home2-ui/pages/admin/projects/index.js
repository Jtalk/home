import {EditProjects} from "../../../component/admin/edit-projects";
import React from "react";
import {OwnerTitled} from "../../../component/about/owner-titled";

export default function Projects() {

    return <>
        <OwnerTitled title={"Edit Projects"}/>
        <EditProjects/>
    </>
}
