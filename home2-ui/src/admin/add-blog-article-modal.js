import React from "react";
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import {ErrorMessage} from "../form/form-message";
import {useForm} from "./common/use-form";
import {Updating} from "../data/reduce/global/enums";
import {useLoadedStateChange} from "../utils/state-change";
import {useHistory} from "react-router";
import {useArticlesError, useArticlesUpdating, useArticleUpdater} from "../data/reduce/articles";

const INITIAL = () => ({title: '', id: '', });

export const AddBlogArticleModal = function () {

    let history = useHistory();

    let errorMessage = useArticlesError();
    let updating = useArticlesUpdating();
    let updated = useLoadedStateChange(updating, {from: Updating.UPDATING, to: Updating.UPDATED});

    let articleUpdater = useArticleUpdater();
    let {data, updater, onSubmit, canSubmit} = useForm({init: INITIAL()});

    let submit = (article) => {
        articleUpdater(article, { id: article.id});
    };
    let clear = () => {
        updater.reloaded(INITIAL());
    };

    if (updated) {
        setTimeout(() => history.push(`/admin/blog/articles/${data.id}`), 1);
    }

    return <Modal size="small" closeIcon onClose={clear} trigger={<Button><Icon name="plus"/>Add entry</Button>}>
        <Modal.Header>Add entry</Modal.Header>
        <Modal.Content>
            <Form error={!!errorMessage}>
                <Form.Field>
                    <label>Blog entry title</label>
                    <Form.Input placeholder="Title" value={data.title} onChange={updater.change("title")}/>
                </Form.Field>
                <Form.Field>
                    <label>Short name for navigation</label>
                    <Form.Input placeholder="(letters, numbers, dashes)" value={data.id} onChange={updater.change("id")}/>
                </Form.Field>
                <ErrorMessage errorMessage={errorMessage}/>
                <Button positive disabled={!canSubmit} onClick={onSubmit(submit)}>Create</Button>
            </Form>
        </Modal.Content>
    </Modal>
};