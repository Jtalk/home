import { Loading } from "../../data/hooks/global/enums";
import { ProjectsMenu } from "../../component/projects/menu/projects-menu";
import { ProjectDescription } from "../../component/projects/project-description";
import React from "react";
import { useRouter } from "next/router";
import { OwnerTitled } from "../../component/about/owner-titled";
import { preloadProjects, useProject, useProjects } from "../../data/hooks/projects/get";
import { preloadOwner } from "../../data/hooks/owner";
import { preloadFooter } from "../../data/hooks/footer";
import { NotFound } from "../../component/error/not-found";

export default function Project() {
  const router = useRouter();
  const { projectId } = router.query;

  const { data: projects, loading: loadingAll } = useProjects();
  let { data: selectedProject, loading } = useProject(projectId);

  if (loadingAll !== Loading.LOADING && !selectedProject) {
    return <NotFound />;
  }
  selectedProject = selectedProject || {};

  return (
    <div>
      <OwnerTitled title={"Projects"} />
      <ProjectsMenu projects={projects || []} selectedProjectId={projectId} />
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
