import React from "react";
import {Grid, Image, Menu} from "semantic-ui-react";
import {imageUrl} from "../utils/image";
import {MarkdownTextArea} from "../shared/text-area";

export const ProjectDescription = function (project) {

    return <Grid stackable centered layout="block">
        <Grid.Column width={3}>
            {project.logoId && <Image size="small" src={imageUrl(project.logoId)} alt={project.title + " Logo"}/>}
            <Menu fluid vertical text layout="block">
                <div className="active item">Overview</div>
                {project.links && project.links.map(link => <a key={link.name} className="item" href={link.href}>{link.name}</a>)}
            </Menu>
        </Grid.Column>
        <Grid.Column width={12}>
            <MarkdownTextArea>{project.description || ""}</MarkdownTextArea>
        </Grid.Column>
    </Grid>
};
