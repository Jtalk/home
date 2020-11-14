import React from "react";
import { ProjectsMenu } from "../../component/projects/menu/projects-menu";
import { ProjectDescription } from "../../component/projects/project-description";
import { Loading } from "../../data/hooks/global/enums";
import { OwnerTitled } from "../../component/about/owner-titled";
import { preloadProjects, useProjects } from "../../data/hooks/projects/get";
import { preloadOwner } from "../../data/hooks/owner";
import { preloadFooter } from "../../data/hooks/footer";

export default function Projects() {
  const { data: projects, loading } = useProjects();
  const selectedProject = projects?.[0] || {};

  return (
    <div>
      <OwnerTitled title={"Projects"} />
      <ProjectsMenu projects={projects || []} />
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
