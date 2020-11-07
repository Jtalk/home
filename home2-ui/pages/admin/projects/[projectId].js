import { useRouter } from "next/router";
import { EditProjects } from "../../../component/admin/edit-projects";
import React from "react";
import { OwnerTitled } from "../../../component/about/owner-titled";

export default function EditProject() {
  const router = useRouter();
  const { projectId } = router.query;

  return (
    <>
      <OwnerTitled title={"Edit Projects"} />
      <EditProjects currentProjectId={projectId} />
    </>
  );
}
