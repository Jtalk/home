import React from "react";
import { ProjectsMenu } from "../../component/projects/menu/projects-menu";
import { ProjectDescription } from "../../component/projects/project-description";
import { Loading } from "../../data/hooks/global/enums";
import { OwnerTitled } from "../../component/about/owner-titled";
import { preloadProjects, useProjects } from "../../data/hooks/projects/get";
import { preloadOwner } from "../../data/hooks/owner";
import { preloadFooter } from "../../data/hooks/footer";
import { isSsrPreloadEnabled } from "../../data/ajax/ssr";
import { InfoMessage } from "../../component/messages/info-message";
import { Segment } from "semantic-ui-react";

export default function Projects() {
  const { data: projects, loading } = useProjects();
  const selectedProject = projects?.[0] || {};

  return (
    <div>
      <OwnerTitled title={"Projects"} />
      <NoProjectsMessageOr show={projects && projects.length === 0}>
        <ProjectsMenu projects={projects || []} />
        <ProjectDescription loading={loading === Loading.LOADING} {...selectedProject} />
      </NoProjectsMessageOr>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const preload = {};
  if (isSsrPreloadEnabled()) {
    preload.owner = await preloadOwner();
    preload.footer = await preloadFooter();
    preload.projects = await preloadProjects();
  }
  return { props: { preload } };
}

function NoProjectsMessageOr({ show, children }) {
  if (!show) {
    return children;
  }
  return (
    <Segment basic padded="very">
      <InfoMessage data-id="no-projects-found-message" header="None found">
        No projects have been added.
      </InfoMessage>
    </Segment>
  );
}
