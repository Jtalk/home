import React, {useCallback, useMemo} from "react";
import {useForm} from "./common/use-form";
import {useArticleUpdater} from "../../data/hooks/articles";
import {editHref} from "../../pages/admin/blog/articles/[articleId]";
import {ErrorMessage} from "../message/error-message";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import LazyIcon from "../lazy-icon";
import {useRouter} from "next/router";

const INITIAL = () => ({title: '', id: '', });

export const AddBlogArticleModal = function () {

    const router = useRouter();

    let {updater: articleUpdater, error: errorMessage} = useArticleUpdater();
    let initial = useMemo(INITIAL, []);
    let {data, updater, onSubmit, canSubmit} = useForm({init: initial});

    let submit = useCallback(async (article) => {
        await articleUpdater(article.id, article);
        await router.push(editHref(article.id));
    }, [articleUpdater, router]);
    let clear = () => {
        updater.reload(INITIAL());
    };

    return <Modal size="small" closeIcon onClose={clear} trigger={<Button><LazyIcon name="plus"/>Add entry</Button>}>
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
