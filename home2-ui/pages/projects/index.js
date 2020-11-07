import React from "react";
import { ProjectsMenu } from "../../component/projects/menu/projects-menu";
import { ProjectDescription } from "../../component/projects/project-description";
import { Loading } from "../../data/hooks/global/enums";
import { OwnerTitled } from "../../component/about/owner-titled";
import { useProjectLoading, useProjects } from "../../data/hooks/projects/get";

export default function Projects() {
  let projects = useProjects() || [];
  let loading = useProjectLoading();
  let selectedProject = projects[0] || {};

  return (
    <div>
      <OwnerTitled title={"Projects"} />
      <ProjectsMenu projects={projects} />
      <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject} />
    </div>
  );
}

export async function getServerSideProps(ctx) {
  // Do nothing, disable automatic static optimisation to access Next Config.
  return { props: {} };
}
