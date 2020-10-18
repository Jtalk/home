import React from "react";
import {Button, Dropdown, Form, Grid, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../../../../component/form-message";
import {useAvailableTags} from "../../../../data/reduce/tags";
import {useForm} from "../../../../component/admin/common/use-form";
import {Loading, Updating} from "../../../../data/reduce/global/enums";
import {DatePicker} from "../../../../component/admin/common/date-picker";
import {
    useArticle,
    useArticleLoading,
    useArticlesError,
    useArticlesUpdating,
    useArticleUpdater
} from "../../../../data/reduce/articles";
import {NotFound} from "../../../../component/error/not-found";
import {useRouter} from "next/router";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import toLower from "lodash/toLower";
import keyBy from "lodash/keyBy";

export default function EditBlogArticle() {

    const router = useRouter();
    const {articleId} = router.query;

    let article = useArticle(articleId);
    let knownTags = useAvailableTags();
    let errorMessage = useArticlesError();
    let loading = useArticleLoading(articleId);
    let updating = useArticlesUpdating();

    let {data, updater, onSubmit, canSubmit} = useForm({init: article});
    let articleUpdater = useArticleUpdater();

    let submit = (updatedArticle) => {
        article && articleUpdater(article.id, editHref(updatedArticle.id), updatedArticle, {});
    };
    let reset = () => {
        article && updater.reload(article);
    };

    if (!article && loading && loading !== Loading.LOADING) {
        return <NotFound/>
    }

    return <EditBlogArticleStateless article={data} submit={onSubmit(submit)} {...{
        knownTags, reset, updater, canSubmit, loading, updating, errorMessage
    }}/>
};

export const EditBlogArticleStateless = function ({article, knownTags = [], submit, reset, updater, canSubmit, loading, updating, errorMessage}) {
    knownTags = uniq([...knownTags, ...(article.tags || [])]);
    let applyTags = (e, {options, value}) => {
        updater.change("tags")(e, {value: uniq(asDropdownText(value, options))});
    };
    let addTag = (e, {value}) => {
        updater.change("tags")(e, {value: uniq([...article.tags, value])});
    };
    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <h2>Edit Blog Post</h2>
                <Form success={updating === Updating.UPDATED}
                      error={updating === Updating.ERROR || loading === Loading.ERROR}
                      loading={loading === Loading.LOADING}>
                    <Grid centered>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <Form.Input label="Title" placeholder="Title" value={article.title || ''}
                                            onChange={updater.change("title")}/>
                                {/*Cannot be "new" for navigational reasons*/}
                                <Form.Input label="Short Title" placeholder="For navigation" value={article.id || ''}
                                            onChange={updater.change("id")}/>
                                <Form.Field>
                                    <Form.Checkbox toggle label="Published" checked={article.published}
                                                   onChange={updater.changeToggle("published")}/>
                                </Form.Field>
                                <Form.Group>
                                    <Form.Field>
                                        <label>Creation Time</label>
                                        <DatePicker value={article.created || new Date()}
                                                    onChange={updater.change("created")}/>
                                    </Form.Field>
                                </Form.Group>
                                {/*There was a JS function on this field, onClick*/}
                                <Form.Field>
                                    <label>Tags</label>
                                    <Dropdown fluid multiple search selection
                                              allowAdditions
                                              options={asDropdownOptions(knownTags)}
                                              value={(article.tags || []).map(toLower)}
                                              onAddItem={addTag}
                                              onChange={applyTags}/>
                                </Form.Field>
                                <SuccessMessage message="Changes successfully saved"/>
                                <ErrorMessage message={errorMessage}/>
                            </Grid.Column>
                            <Grid.Column verticalAlign="middle" width={4}>
                                <Button.Group>
                                    <Button primary disabled={!canSubmit} loading={updating === Updating.UPDATING}
                                            onClick={submit}>Save</Button>
                                    <Button.Or/>
                                    <Button secondary onClick={reset}>Cancel</Button>
                                </Button.Group>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <Form.Field>
                                    <TextArea label="Content" value={article.content || ''}
                                              onChange={updater.change("content")}/>
                                </Form.Field>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
            </Segment>
        </Grid.Column>
    </Grid>
};

export function editHref(articleId) {
    articleId = articleId || "";
    return `/admin/blog/articles/${articleId}`;
}

function asDropdownOptions(tags) {
    const mapped = tags.map(t => ({text: t, value: toLower(t)}));
    return uniqBy(mapped, "value")
}

function asDropdownText(values, options) {
    let dict = keyBy(options, "value");
    return values.map(v => {
        let found = dict[v];
        return (found && found.text) || v;
    });
}
