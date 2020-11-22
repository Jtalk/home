import Link from "next/link";
import { ProjectsPath } from "../../../utils/paths";
import React from "react";

export const ProjectTab = function ({ project, active }) {
  if (active) {
    return (
      <div data-id="project-tab" className="active item">
        {project.title}
      </div>
    );
  } else {
    return (
      <Link shallow href={`${ProjectsPath}/${project.id}`}>
        <a data-id="project-tab" className="item">
          {project.title}
        </a>
      </Link>
    );
  }
};
