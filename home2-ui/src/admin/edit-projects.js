import React, {useState} from "react";
import {Button, Divider, Form, Grid, Icon, Image, Input, List, Menu, Message, Segment} from "semantic-ui-react";
import {Link, Redirect, useParams} from "react-router-dom";
import {ErrorMessage} from "../form/form-message";
import {
    useProjectDeleter,
    useProjectDeleting,
    useProjectError,
    useProjectLoading,
    useProjects,
    useProjectUpdater,
    useProjectUpdating
} from "../data/reduce/projects";
import {useLoadedStateChange} from "../utils/state-change";
import {Deleting, Loading, Updating} from "../data/reduce/global/enums";
import {useForm} from "./common/use-form";
import {imageUrl} from "../utils/image";
import _ from "lodash";
import uuid from "uuid/v1";
import {PartialRoute} from "../navigation/route";
import {Titled} from "react-titled";

const BASE_HREF = "/admin/projects";
const NEW_PROJECT_ID = "new";
const MAKE_NEW_PROJECT = (order) => ({
    id: NEW_PROJECT_ID,
    title: "New Project",
    logoId: "",
    published: false,
    order: order,
    description: "",
    links: [],
});

export const EditProjectsRouter = function () {
    return <React.Fragment>
        <Titled title={t => "Edit Projects | " + t}/>
        <PartialRoute exact path="/">
            <EditProjectsRoute/>
        </PartialRoute>
        <PartialRoute path="/:projectId">
            <EditProjectsRoute/>
        </PartialRoute>
    </React.Fragment>
};

export const EditProjectsRoute = function () {
    let projectId = useParams().projectId;
    return <EditProjects currentProjectId={projectId}/>
};

export const EditProjects = function ({currentProjectId}) {

    let projects = useProjects(true);
    let loading = useProjectLoading();
    let updating = useProjectUpdating();
    let deleting = useProjectDeleting();
    let errorMessage = useProjectError();

    let loadingStatusChanged = useLoadedStateChange(loading, {
        from: Loading.LOADING, to: Loading.READY
    });
    let updateStatusChanged = useLoadedStateChange(updating, {
        from: Updating.UPDATING, to: Updating.UPDATED
    });
    let deleteStatusChanged = useLoadedStateChange(deleting, {
        from: Deleting.DELETING, to: Deleting.DELETED
    });

    let submit = useProjectUpdater();
    let remove = useProjectDeleter();

    if (deleteStatusChanged) {
        return <Redirect to={BASE_HREF}/>
    }
    // Force redirect to the new project if present.
    // This way we can avoid complicated state management
    // and just force the user to edit the project first.
    if (hasNewProject(projects) && currentProjectId !== NEW_PROJECT_ID) {
        return <Redirect to={editHref(NEW_PROJECT_ID)}/>
    }

    return <EditProjectsStateless {...{projects, errorMessage, updating, deleting, currentProjectId, submit, remove}}
                                  forceReload={loadingStatusChanged || updateStatusChanged || deleteStatusChanged}/>;
};

export const EditProjectsStateless = function ({projects, errorMessage, updating, deleting, currentProjectId, forceReload, submit, remove}) {

    let currentProject = _.find(projects, p => p.id === currentProjectId) || _.chain(projects).values().first().value();

    let add = () => {
        let maxOrderProject = _.chain(projects).sortBy("order").last().value();
        let maxOrder = (maxOrderProject && maxOrderProject.order) || -1;
        let newProject = MAKE_NEW_PROJECT(maxOrder + 1);
        submit(newProject.id, newProject, {});
    };
    let move = (shift) => {
        return () => {
            let currentProjectIndex = _.findIndex(projects, p => p.id === currentProject.id);
            if (currentProjectIndex === -1) {
                throw Error("Attempting to move a non-existent project id " + currentProject.id);
            }
            let targetIndex = currentProjectIndex + shift;
            if (targetIndex < 0 || targetIndex >= projects.length) {
                console.debug(`Cannot move project ${currentProject.id} with ${shift}: already on the edge`, projects);
                return;
            }
            let tmp = projects[targetIndex].order;
            projects[targetIndex].order = projects[currentProjectIndex].order;
            projects[currentProjectIndex].order = tmp;
            submit(projects[targetIndex].id, projects[targetIndex]);
            submit(currentProject.id, currentProject);
        };
    };

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <Menu tabular>
                    {
                        projects.map(project => project.id === currentProject.id
                            ? <Menu.Item active key={project.id}>{project.title}</Menu.Item>
                            : <Link className="item" to={editHref(project.id)} key={project.id}>{project.title}</Link>)
                    }
                    <Menu.Item>
                        <Icon link name="plus" disabled={currentProjectId === NEW_PROJECT_ID} onClick={add}/>
                    </Menu.Item>
                    { currentProject && <Menu.Menu position="right">
                        <Menu.Item>
                            <Icon link name="left arrow" onClick={move(-1)}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Icon link name="right arrow" onClick={move(1)}/>
                        </Menu.Item>
                    </Menu.Menu> }
                </Menu>
                <Grid centered>
                    <Grid.Column width={15} layout="block">
                        {
                            !currentProject
                                ? <Segment raised><h2>No projects available</h2></Segment>
                                : <EditProject key={currentProject.id}
                                               project={currentProject}
                                               errorMessage={errorMessage}
                                               updating={updating}
                                               deleting={deleting}
                                               forceReload={forceReload}
                                               submit={submit}
                                               remove={remove}/>
                        }
                    </Grid.Column>
                </Grid>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditProject = function ({project, errorMessage, updating, deleting, forceReload, submit, remove}) {

    let addLinkIds = (links) => {
        return links.map(l => Object.assign({}, l, {id: uuid()}));
    };
    let dropLinkIds = (links) => {
        return links.map(l => _.omit(l, "id"));
    };

    project = Object.assign({}, project, {links: addLinkIds(project.links)});
    let submitClear = (editedProject, files) => {
        editedProject = Object.assign({}, editedProject, {links: dropLinkIds(editedProject.links)});
        submit(project.id, editedProject, files);
    };

    let {onSubmit, data, updater, canSubmit, edited} = useForm({
        init: project,
        updateStatus: updating
    });

    let reorderLink = (index, direction) => updater.reorder(index, index + direction, "links");
    let addLink = updater.addItem(emptyLink(), "links");
    let updateLink = (index) => updater.changeItem(index, "links");
    let removeLink = (index) => updater.removeItem(index, "links");

    if (forceReload) {
        if (data.order === project.order || !edited) {
            updater.reloaded(project);
        } else {
            updater.change("order")(null, {value: project.order});
        }
    }

    return <div>
        <h2>Edit project</h2>
        <Form error={!!errorMessage}
              success={updating === Updating.UPDATED}>
            <Divider/>
            <Grid stackable centered>
                <Grid.Row>
                    <Grid.Column width={11}>
                        <Form.Input label="Project Title" placeholder="Title" value={data.title || ''} onChange={updater.change("title")}/>
                        <Form.Input label="Internal ID" placeholder="(letters, digits, dashes)" value={data.id || ''} onChange={updater.change("id")}/>
                        <Form.Checkbox toggle label="This project is published" checked={!!data.published} onChange={updater.changeToggle("published")}/>
                        <ProjectLinks className="field" links={data.links} add={addLink} reorder={reorderLink} update={updateLink} remove={removeLink}/>
                        <ErrorMessage message={errorMessage}/>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Form.Field>
                            {data.logoId && <Image src={imageUrl(data.logoId)} alt="Current project logo"/>}
                            <Input type="file" accept="image/jpeg, image/png, image/svg, image/gif" onChange={updater.changeFile("logo")}/>
                        </Form.Field>
                        <Button primary loading={updating === Updating.UPDATING} disabled={!canSubmit} onClick={onSubmit(submitClear)}>Save</Button>
                        <Button secondary onClick={() => updater.reloaded(project)}>Clear</Button>
                        <Button color="red" loading={deleting === Deleting.DELETING} onClick={() => remove(project.id)}>Delete</Button>
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

export const ProjectLinks = function ({links, className, add, reorder, update, remove}) {
    return <div className={className}>
        <label>Project links <Icon link name="plus" onClick={add}/></label>
        Edit and rearrange links shown at the left panel
        <List celled verticalAlign="middle" ordered>
            {
                links.map((link, index, links) => {
                    return <EditableProjectLink key={link.id} {...{link, links, index, reorder, update, remove}}/>
                })
            }
        </List>
    </div>
};

export const EditableProjectLink = function ({link, index, links, reorder, update, remove}) {

    let [editing, setEditing] = useState();

    if (!link.name && !editing) {
        // Enforce editing for newly created empty links
        setEditing(true);
    }

    let edit = () => setEditing(true);
    let cancelEdit = () => setEditing(false);
    let updateLink = (e, {value}) => {
        update(index)(e, {value});
        setEditing(false);
    };

    if (editing) {
        return <ProjectEditLink link={link}
                                updateLink={updateLink}
                                cancelEdit={cancelEdit}/>
    } else {
        return <ProjectLink link={link}
                            edit={edit}
                            remove={remove(index)}
                            reorder={direction => reorder(index, direction)}
                            canMoveUp={index !== 0}
                            canMoveDown={index !== links.length - 1}/>
    }
};

export const ProjectEditLink = function ({link, updateLink, cancelEdit}) {

    let [editedLink, setEditedLink] = useState(Object.assign({}, link));
    let [errorMessage, setErrorMessage] = useState();
    let [beingEdited, setBeingEdited] = useState(false);

    if (!beingEdited) {
        console.log("Editing started for link, reinitialising", link);
        setEditedLink(link);
        setErrorMessage(undefined);
        setBeingEdited(true);
    }

    let changeLink = (e, {name, value}) => {
        let newLink = Object.assign({}, editedLink, {[name]: value});
        setEditedLink(newLink);
    };
    let applyEdit = (e) => {
        let errorMessage = "";
        if (!editedLink.name) {
            errorMessage += "name must be defined";
        }
        if (!editedLink.href) {
            errorMessage && (errorMessage += ", ");
            errorMessage += "link target must be defined";
        }
        if (errorMessage) {
            setErrorMessage(errorMessage);
        } else {
            updateLink(e, {value: editedLink});
            setBeingEdited(false);
        }
    };
    let abortEdit = () => {
        setEditedLink(link);
        setBeingEdited(false);
        cancelEdit();
    };

    return <List.Item key={link.name}>
        <List.Content floated="right">
            <Icon link color="green" name="thumbs up outline" onClick={applyEdit}/>
            <Icon link color="red" name="thumbs down outline" onClick={abortEdit}/>
        </List.Content>
        <List.Content>
            <List.Header>
                <Input transparent size="mini" name="name" placeholder="Link content" value={editedLink.name} onChange={changeLink}/>
            </List.Header>
            <List.Description>
                <Input transparent size="mini" name="href" placeholder="Link target" value={editedLink.href} onChange={changeLink}/>
                {errorMessage && <Message negative size="mini">
                    {errorMessage}
                </Message>}
            </List.Description>
        </List.Content>
    </List.Item>;
};

export const ProjectLink = function ({link, canMoveUp, canMoveDown, edit, reorder, remove}) {
    return <List.Item key={link.name}>
        <List.Content floated="right">
            <Icon link name="edit" onClick={edit}/>
            <LockableIcon locked={!canMoveUp}>
                <Icon link name="angle up" onClick={reorder(-1)}/>
            </LockableIcon>
            <LockableIcon locked={!canMoveDown}>
                <Icon link name="angle down" onClick={reorder(+1)}/>
            </LockableIcon>
            <Icon link name="remove"
                  color="red"
                  onClick={remove}/>
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

function hasNewProject(projects) {
    return _.find(projects, v => v.id === NEW_PROJECT_ID);
}

function emptyLink() {
    return {id: uuid(), name: '', href: ''};
}

function editHref(id) {
    return `${BASE_HREF}/${id}`;
}
