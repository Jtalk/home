import React from "react";
import {Divider, Form, Grid, Icon, Image, Input, List, Menu, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {ErrorMessage} from "../form/form-message";
import {useAjax, useAjaxLoader} from "../context/ajax-context";
import {load, update as updateProject} from "../data/reduce/projects";
import {useDispatch} from "react-redux";
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
                        <div className="field">
                            <label>Project links <Icon name="plus"/></label>
                            Edit and rearrange links shown at the left panel
                            <List celled verticalAlign="middle" ordered>
                                {
                                    data.links.map((link, i, links) => {
                                        return <List.Item key={link.name}>
                                            <List.Content floated="right">
                                                <Icon link name="edit"/>
                                                {
                                                    i === 0
                                                        ? <Icon name="lock"/>
                                                        : <Icon link name="angle up"
                                                                onClick={reorderLink(updater.change("links"), links, i, i - 1)}/>
                                                }
                                                {
                                                    i === links.length - 1
                                                        ? <Icon link name="lock"/>
                                                        : <Icon link name="angle down"
                                                                onClick={reorderLink(updater.change("links"), links, i, i + 1)}/>
                                                }
                                                <Icon link name="remove"
                                                      color="red"
                                                      onClick={removeLink(updater.change("links"), links, i)}/>
                                            </List.Content>
                                            <List.Content>
                                                <List.Header>{link.name}</List.Header>
                                                <List.Description>
                                                    <Link to={link.href}/>
                                                </List.Description>
                                            </List.Content>
                                        </List.Item>
                                    })
                                }
                            </List>
                        </div>
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

function removeLink(updater, links, index) {
    return (e) => {
        let copy = [...links];
        delete copy[index];
        updater(e, {value: copy});
    }
}

function reorderLink(updater, links, fromIndex, toIndex) {
    return (e) => {
        let copy = [...links];
        let item = copy[fromIndex];
        delete copy[fromIndex];
        copy.splice(toIndex, 0, item);
        updater(e, {value: copy});
    };
}

function editHref(id) {
    return `/admin/projects/${id}`
}