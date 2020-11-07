import { Loading } from "../../data/hooks/global/enums";
import { ProjectsMenu } from "../../component/projects/menu/projects-menu";
import { ProjectDescription } from "../../component/projects/project-description";
import React from "react";
import { useRouter } from "next/router";
import { NotFound } from "../../component/error/not-found";
import { OwnerTitled } from "../../component/about/owner-titled";
import { preloadProjects, useProject, useProjectLoading, useProjects } from "../../data/hooks/projects/get";
import { preloadOwner } from "../../data/hooks/owner";
import { preloadFooter } from "../../data/hooks/footer";

export default function Project() {
  let router = useRouter();
  let { projectId } = router.query;

  let projects = useProjects() || [];
  let loading = useProjectLoading();
  let selectedProject = useProject(projectId);

  if (projects?.length && loading !== Loading.LOADING && !selectedProject) {
    return <NotFound />;
  }
  selectedProject = selectedProject || projects[0] || {};

  return (
    <div>
      <OwnerTitled title={"Projects"} />
      <ProjectsMenu projects={projects} selectedProjectId={projectId} />
      <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject} />
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const preload = {};
  preload.owner = await preloadOwner();
  preload.footer = await preloadFooter();
  preload.projects = await preloadProjects();
  return { props: { preload } };
}
