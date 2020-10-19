import {
    useProject,
    useProjectDeleter,
    useProjectDeleting,
    useProjectError,
    useProjectLoading,
    useProjectUpdater,
    useProjectUpdating
} from "../../data/reduce/projects";
import {useForm} from "./common/use-form";
import React, {useState} from "react";
import {Deleting, Loading, Updating} from "../../data/reduce/global/enums";
import {useFormErrors} from "./common/use-errors";
import {ContentPlaceholderOr} from "../placeholder/content-placeholder";
import {ErrorMessage} from "../message/error-message";
import {OptionalImage} from "../image/optional-image";
import {EditProjectsPath} from "../../utils/paths";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import Input from "semantic-ui-react/dist/commonjs/elements/Input";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import List from "semantic-ui-react/dist/commonjs/elements/List";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const EditProject = function ({projectId}) {

    let project = useProject(projectId, true) || {};
    let loading = useProjectLoading();
    let updating = useProjectUpdating();
    let deleting = useProjectDeleting();
    let errorMessage = useProjectError();

    let {onSubmit, data, updater, canSubmit} = useForm({
        init: project
    });

    let update = useProjectUpdater();
    let deleter = useProjectDeleter();

    let submit = onSubmit(async (updated, extra) => await update(projectId, `${EditProjectsPath}/${data.id || ""}`, updated, extra));
    let reset = async () => await updater.reload(project);
    let remove = async () => await deleter(projectId, `${EditProjectsPath}/${projectId || ""}`);

    return <ContentPlaceholderOr loading={!project} lines={20}>
        <EditProjectStateless {...{
            loading, updating, deleting, errorMessage, updater, data, canSubmit, submit, reset, remove
        }}/>
    </ContentPlaceholderOr>
}

export const EditProjectStateless = function ({loading, updating, deleting, errorMessage, updater, data, canSubmit, submit, reset, remove}) {

    return <React.Fragment>
        <h2>Edit project</h2>
        <Form error={loading === Loading.ERROR || updating === Updating.ERROR || deleting === Deleting.DELETE_ERROR}
              success={updating === Updating.UPDATED || deleting === Deleting.DELETED}>
            <Divider/>
            <Grid stackable centered>
                <Grid.Row>
                    <Grid.Column width={11}>
                        <Form.Input label="Project Title" placeholder="Title" value={data.title || ''}
                                    onChange={updater.change("title")}/>
                        <Form.Input label="Internal ID" placeholder="(letters, digits, dashes)" value={data.id || ''}
                                    onChange={updater.change("id")}/>
                        <Form.Checkbox toggle label="This project is published" checked={!!data.published}
                                       onChange={updater.changeToggle("published")}/>
                        <ProjectLinks className="field" links={data.links} updater={updater}/>
                        <ErrorMessage message={errorMessage}/>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Form.Field>
                            <OptionalImage id={data.logoId} alt="Current project logo"/>
                            <Input type="file" accept="image/jpeg, image/png, image/svg, image/gif"
                                   onChange={updater.changeFile("logo")}/>
                        </Form.Field>
                        <Button primary loading={updating === Updating.UPDATING} disabled={!canSubmit}
                                onClick={submit}>Save</Button>
                        <Button secondary onClick={reset}>Clear</Button>
                        <Button color="red" loading={deleting === Deleting.DELETING}
                                onClick={remove}>Delete</Button>
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
    </React.Fragment>
};

const ProjectLinks = function ({links, className, updater}) {

    let reorder = (index, direction) => updater.reorder(index, index + direction, "links");
    let add = updater.addItem(emptyLink(), "links");
    let update = (index) => updater.changeItem(index, "links");
    let remove = (index) => updater.removeItem(index, "links");

    return <div className={className}>
        <label>Project links <Icon link name="plus" onClick={add}/></label>
        Edit and rearrange links shown at the left panel
        <List celled verticalAlign="middle" ordered>
            {
                links.map((link, index, links) => {
                    return <EditableProjectLink key={index} {...{link, links, index, reorder, update, remove}}/>
                })
            }
        </List>
    </div>
};

const EditableProjectLink = function ({link, index, links, reorder, update, remove}) {

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

const ProjectEditLink = function ({link, updateLink, cancelEdit}) {

    let {data, updater} = useForm({init: link});
    let errors = useFormErrors(link);

    let applyEdit = (e) => {
        errors.validate(data.name, "name must be defined")("name");
        errors.validate(data.href, "href must be defined")("href");
        if (!errors.hasErrors()) {
            updateLink(e, {value: data});
        }
    };

    return <List.Item key={link.name}>
        <List.Content floated="right">
            <Icon link color="green" name="thumbs up outline" onClick={applyEdit}/>
            <Icon link color="red" name="thumbs down outline" onClick={cancelEdit}/>
        </List.Content>
        <List.Content>
            <List.Header>
                <Input transparent size="mini"
                       name="name"
                       placeholder="Link content"
                       value={data.name}
                       error={errors.hasErrors("name")}
                       onChange={updater.change("name")}/>
            </List.Header>
            <List.Description>
                <Input transparent size="mini"
                       name="href"
                       placeholder="Link target"
                       value={data.href}
                       error={errors.hasErrors("href")}
                       onChange={updater.change("href")}/>
                {errors.hasErrors() && <Message negative size="mini">
                    {[errors.errorFor("name") || "", errors.errorFor("href") || ""].join(", ")}
                </Message>}
            </List.Description>
        </List.Content>
    </List.Item>;
};

const ProjectLink = function ({link, canMoveUp, canMoveDown, edit, reorder, remove}) {
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

const LockableIcon = function ({locked, children}) {
    if (locked) {
        return <Icon link name="lock"/>
    } else {
        return children;
    }
};

function emptyLink() {
    return {name: '', href: ''};
}

