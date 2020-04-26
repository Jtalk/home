import React from "react";
import {Grid, Menu} from "semantic-ui-react";
import {MarkdownTextArea} from "../common/text-area";
import {OptionalImage} from "../common/image";
import {ContentPlaceholderOr, ImagePlaceholderOr} from "../utils/placeholder";

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
