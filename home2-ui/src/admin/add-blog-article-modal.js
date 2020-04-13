import React, {useMemo} from "react";
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import {ErrorMessage} from "../form/form-message";
import {useForm} from "./common/use-form";
import {useArticlesError, useArticleUpdater} from "../data/reduce/articles";
import {editHref} from "./edit-blog-article";

const INITIAL = () => ({title: '', id: '', });

export const AddBlogArticleModal = function () {

    let errorMessage = useArticlesError();

    let articleUpdater = useArticleUpdater();
    let initial = useMemo(INITIAL, []);
    let {data, updater, onSubmit, canSubmit} = useForm({init: initial});

    let submit = (article) => {
        articleUpdater(article.id, editHref(article.id), article);
    };
    let clear = () => {
        updater.reload(INITIAL());
    };

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