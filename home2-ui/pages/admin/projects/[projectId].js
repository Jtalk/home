import {useRouter} from "next/router";
import {EditProjects} from "../../../component/admin/edit-projects";
import React from "react";

export default function EditProject() {
    const router = useRouter();
    const {projectId} = router.query;

    return <EditProjects currentProjectId={projectId}/>
}
