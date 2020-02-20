import React from "react";
import "../bbcode/tags";
import {Grid, Image, Menu} from "semantic-ui-react";
import {formatMarkup} from "../utils/text-markup";
import {imageUrl} from "../utils/image";

export const ProjectDescription = function (project) {

    return <Grid stackable centered layout="block">
        <Grid.Column width={3}>
            {project.logoId && <Image size="small" src={imageUrl(project.logoId)} alt={project.title + " Logo"}/>}
            <Menu fluid vertical text layout="block">
                <div className="active item">Overview</div>
                {project.links.map(link => <a key={link.name} className="item" href={link.href}>{link.name}</a>)}
            </Menu>
        </Grid.Column>
        <Grid.Column width={12}>
            {formatMarkup(project.description)}
        </Grid.Column>
    </Grid>
};
