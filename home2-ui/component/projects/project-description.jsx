import React from "react";
import {Grid, Menu} from "semantic-ui-react";
import {MarkdownTextArea} from "../text-area";
import {ContentPlaceholderOr} from "../placeholder/content-placeholder";
import {ImagePlaceholderOr} from "../placeholder/image-placeholder";
import {OptionalImage} from "../image/optional-image";

export const ProjectDescription = function (project) {
    let {loading} = project;
    return <Grid stackable centered layout="block">
        <Grid.Column width={3}>
            <ImagePlaceholderOr loading={loading}>
                <OptionalImage size="small" id={project.logoId} alt={project.title + " Logo"}/>
            </ImagePlaceholderOr>
            <ContentPlaceholderOr loading={loading} lines={8}>
                <Menu fluid vertical text layout="block">
                    <div className="active item">Overview</div>
                    {project.links && project.links.map(link => <a key={link.name} className="item"
                                                                   href={link.href}>{link.name}</a>)}
                </Menu>
            </ContentPlaceholderOr>
        </Grid.Column>
        <Grid.Column width={12}>
            <ContentPlaceholderOr header loading={loading} lines={20}>
                <MarkdownTextArea>{project.description || ""}</MarkdownTextArea>
            </ContentPlaceholderOr>
        </Grid.Column>
    </Grid>
};
