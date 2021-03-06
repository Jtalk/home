import React from "react";
import MarkdownTextArea from "../text-area";
import { ContentPlaceholderOr } from "../placeholder/content-placeholder";
import { ImagePlaceholderOr } from "../placeholder/image-placeholder";
import { OptionalImage } from "../image/optional-image";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import styles from "./project-description.module.css";

export const ProjectDescription = function (project) {
  let { loading } = project;
  return (
    <Grid stackable centered layout="block" data-id="project-page">
      <Grid.Column width={3}>
        <ImagePlaceholderOr loading={loading}>
          <OptionalImage
            className={styles.projectlogo}
            data-id="project-logo"
            id={project.logoId}
            alt={project.title + " Logo"}
          />
        </ImagePlaceholderOr>
        <ContentPlaceholderOr loading={loading} lines={8}>
          <Menu fluid vertical text layout="block" data-id="project-links">
            <div className="active item">Overview</div>
            {project.links &&
              project.links.map((link) => (
                <a key={link.name} className="item" href={link.href} data-id="project-link">
                  {link.name}
                </a>
              ))}
          </Menu>
        </ContentPlaceholderOr>
      </Grid.Column>
      <Grid.Column width={12}>
        <ContentPlaceholderOr header loading={loading} lines={20}>
          <MarkdownTextArea data-id="project-description">{project.description || ""}</MarkdownTextArea>
        </ContentPlaceholderOr>
      </Grid.Column>
    </Grid>
  );
};
