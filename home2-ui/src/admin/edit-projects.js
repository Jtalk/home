import React from "react";
import {Divider, Form, Grid, Icon, Image, Input, List, Menu, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {ErrorMessage} from "../form/form-message";
import {useAjax, useAjaxLoader} from "../context/ajax-context";
import {load, update as updateProject} from "../data/reduce/projects";
import {useDispatch} from "react-redux";
import {useState} from "react";
import {useImmutableSelector} from "../utils/redux-store";
import {useStateChange} from "../utils/state-change";
import {Loading, Updating} from "../data/reduce/global/enums";
import {useForm} from "./common/use-form";
import {imageUrl} from "../utils/image";
import _ from "lodash";

// eslint-disable-next-line no-unused-vars
let projectsExampleToDeleteAfterBackendDone = [
    {
        title: "Project 1",
        id: "project-1",
        logoId: "avatar.png",
        description: "[h1]Header 1 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
            " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
            " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
            " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
            " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        links: [{name: "BitBucket", href: "/example"}, {name: "Demo", href: "/example"}]
    },
    {
        title: "Project 2",
        id: "project-2",
        logoId: "avatar.png",
        description: "[h1]Header 2 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
            " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
            " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
            " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
            " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        links: [{name: "BitBucket", href: "/example"}, {name: "Demo", href: "/example"}]
    }
];

export const EditProjects = function ({currentProjectId}) {

    useAjaxLoader(load);

    let ajax = useAjax();
    let dispatch = useDispatch();
    let projects = useImmutableSelector("projects", ["data"]);
    let [loadingStatusChanged] = useStateChange("projects", ["loading"], {
        from: Loading.LOADING, to: Loading.READY
    });
    let [updateStatusChanged, updateStatus] = useStateChange("projects", ["updating"], {
        from: Updating.UPDATING, to: Updating.UPDATED
    });
    let errorMessage = useImmutableSelector("owner", ["errorMessage"]);

    let submit = (project, {logo}) => {
        dispatch(updateProject(ajax, project.id, project, logo));
    };

    return <EditProjectsStateless {...{projects, errorMessage, updateStatus, currentProjectId, submit}} forceReload={loadingStatusChanged || updateStatusChanged}/>;
};

export const EditProjectsStateless = function ({projects, errorMessage, updateStatus, currentProjectId, forceReload, submit}) {

    let currentProject = _.find(projects, p => p.id === currentProjectId) || _.chain(projects).values().first().value();

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <Menu tabular>
                    {
                        projects.map(project => project.id === currentProjectId
                            ? <Menu.Item active key={project.id}>{project.title}</Menu.Item>
                            : <Link className="item" to={editHref(project.id)} key={project.id}>{project.title}</Link>)
                    }
                    <Menu.Item>
                        <Icon name="plus"/>
                    </Menu.Item>
                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Icon name="left arrow"/>
                        </Menu.Item>
                        <Menu.Item>
                            <Icon name="right arrow"/>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Grid centered>
                    <Grid.Column width={15} layout="block">
                        {
                            !currentProject
                                ? <Segment raised><h2>No projects available</h2></Segment>
                                : <EditProject project={currentProject}
                                               errorMessage={errorMessage}
                                               updateStatus={updateStatus}
                                               forceReload={forceReload}
                                               submit={submit}/>
                        }
                    </Grid.Column>
                </Grid>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditProject = function ({project, errorMessage, updateStatus, forceReload, submit}) {

    let {onSubmit, data, updater, canSubmit} = useForm({
        init: project,
        updateStatus
    });

    if (forceReload || project.id !== data.id) {
        updater.reloaded(project);
    }

    return <div>
        <h2>Edit project</h2>
        <Form onSubmit={onSubmit(submit)}
              error={!!errorMessage}
              success={updateStatus === Updating.UPDATED}>
            <Divider/>
            <Grid stackable centered>
                <Grid.Row>
                    <Grid.Column width={11}>
                        <Form.Input label="Project Title" placeholder="Title" value={data.title || ''} onChange={updater.change("title")}/>
                        <Form.Input label="Internal ID" placeholder="(letters, digits, dashes)" value={data.id || ''} onChange={updater.change("id")}/>
                        <Form.Checkbox toggle label="This project is published" checked={!!data.published} onChange={updater.change("published")}/>
                        <ProjectLinks className="field" links={data.links} setLinks={links => updater.change("links")(null, {value: links})}/>
                        <ErrorMessage message={errorMessage}/>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Form.Field>
                            {data.logoId && <Image src={imageUrl(data.logoId)} alt="Current project logo"/>}
                            <Input type="file" accept="image/jpeg, image/png, image/svg, image/gif" onChange={updater.changeFile("logo")}/>
                        </Form.Field>
                        <Form.Button primary disabled={!canSubmit}>Save</Form.Button>
                        <Form.Button secondary>Clear</Form.Button>
                        <Form.Button color="red">Delete</Form.Button>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <Form.TextArea placeholder="Project Description"
                                       value={data.description || ''}
                                       onChange={updater.change("description")}/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Form>
    </div>
};

export const ProjectLinks = function ({links, setLinks, className}) {
    return <div className={className}>
        <label>Project links <Icon name="plus"/></label>
        Edit and rearrange links shown at the left panel
        <List celled verticalAlign="middle" ordered>
            {
                links.map((link, index, links) => {
                    return <EditableProjectLink key={link.name} {...{link, links, setLinks, index}}/>
                })
            }
        </List>
    </div>
};

export const EditableProjectLink = function ({link, index, setLinks, links}) {

    let [editing, setEditing] = useState();

    let reorder = (direction) => reorderLink(setLinks, links, index, index + direction);
    let remove = () => removeLink(setLinks, links, index);

    if (editing) {
        // TBD
        setEditing(true);
    } else {
        return <ProjectLink link={link}
                            remove={remove}
                            reorder={reorder}
                            canMoveUp={index !== 0}
                            canMoveDown={index !== links.length - 1}/>
    }
};

export const ProjectLink = function ({link, canMoveUp, canMoveDown, reorder, remove}) {
    return <List.Item key={link.name}>
        <List.Content floated="right">
            <Icon link name="edit"/>
            <LockableIcon locked={!canMoveUp}>
                <Icon link name="angle up" onClick={reorder(-1)}/>
            </LockableIcon>
            <LockableIcon locked={!canMoveDown}>
                <Icon link name="angle down" onClick={reorder(+1)}/>
            </LockableIcon>
            <Icon link name="remove"
                  color="red"
                  onClick={remove()}/>
        </List.Content>
        <List.Content>
            <List.Header>{link.name}</List.Header>
            <List.Description>
                <a href={link.href}>{link.href}</a>
            </List.Description>
        </List.Content>
    </List.Item>;
};

export const LockableIcon = function ({locked, children}) {
    if (locked) {
        return <Icon link name="lock"/>
    } else {
        return _.castArray(children);
    }
};

function removeLink(setLinks, links, index) {
    return (e) => {
        let copy = [...links];
        copy.splice(index, 1);
        setLinks(copy);
    }
}

function reorderLink(setLinks, links, fromIndex, toIndex) {
    return (e) => {
        let copy = [...links];
        let item = copy[fromIndex];
        copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, item);
        setLinks(copy);
    };
}

function editHref(id) {
    return `/admin/projects/${id}`
}