import React from "react";
import { ProjectTab } from "./projects-menu-tab";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";

export const ProjectsMenu = function ({ projects = [], selectedProjectId }) {
  return (
    <Menu tabular layout="block" data-id="projects-tabs">
      {projects.map((p, i) => {
        let isSelectedId = selectedProjectId && p.id === selectedProjectId;
        let noneSelectedMeansFirst = !selectedProjectId && i === 0;
        return <ProjectTab key={p.id} project={p} active={isSelectedId || noneSelectedMeansFirst} />;
      })}
    </Menu>
  );
};
