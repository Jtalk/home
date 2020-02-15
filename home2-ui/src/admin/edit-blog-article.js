import React, {useState} from "react";
import {Button, Dropdown, Form, Grid, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {useAjax, useLoader} from "../context/ajax-context";
import {load, update} from "../data/reduce/article";
import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../utils/redux-store";
import {useForm} from "./common/use-form";
import {Loading, Updating} from "../data/reduce/global/enums";
import {useStateChange} from "../utils/state-change";
import {DatePicker} from "./common/date-picker";
import {Redirect} from "react-router";

// eslint-disable-next-line
let tempArticle = {
    article: {
        id: "blog-entry-1",
        title: "Blog Entry 1",
        tags: ["Java", "React"],
        content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
            " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
            " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
            " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
            " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        published: true,
        created: new Date(2017, 11, 15, 12, 30)
    },
    knownTags: [
        {key: "CSS", text: "CSS", value: "CSS"},
        {key: "React", text: "React", value: "React"},
        {key: "Java", text: "Java", value: "Java"},
        {key: "Scala", text: "Scala", value: "Scala"}
    ]
};

export const EditBlogArticle = function ({articleId}) {

    let ajax = useAjax();
    let dispatch = useDispatch();

    useLoader(load, ajax, articleId);

    let article = useImmutableSelector("article", ["data"]);
    let knownTags = [
        {key: "CSS", text: "CSS", value: "CSS"},
        {key: "React", text: "React", value: "React"},
        {key: "Java", text: "Java", value: "Java"},
        {key: "Scala", text: "Scala", value: "Scala"}
    ];
    let errorMessage = useImmutableSelector("article", ["errorMessage"]);
    let [loaded, loadingStatus] = useStateChange("article", ["loading"], {from: Loading.LOADING, to: Loading.READY});
    let [updated, updateStatus] = useStateChange("article", ["updating"], {from: Updating.UPDATING, to: Updating.UPDATED});

    let {data, updater, onSubmit} = useForm({init: article, updateStatus});

    let forceReload = loaded || updated;
    if (forceReload) {
        updater.reloaded(article);
    }

    let submit = (updatedArticle) => {
        dispatch(update(ajax, articleId, updatedArticle));
    };
    let reset = () => {
        updater.reloaded(article);
    };

    if (article && article.id && article.id !== articleId) {
        return <Redirect to={editHref(article.id)}/>
    }

    return <EditBlogArticleStateless article={data} submit={onSubmit(submit)} {...{knownTags, reset, updater, loadingStatus, updateStatus, errorMessage}}/>
};

export const EditBlogArticleStateless = function ({article, knownTags, submit, reset, updater, loadingStatus, updateStatus, errorMessage}) {

    let changeDateTime = (e, {value}) => {
        updater.change("created")(null, {value});
    };
    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <h2>Edit Blog Post</h2>
                <Form success={updateStatus === Updating.UPDATED}
                      error={!!errorMessage}
                      loading={loadingStatus === Loading.LOADING}>
                    <Grid centered>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <Form.Input label="Title" placeholder="Title" value={article.title || ''} onChange={updater.change("title")} />
                                {/*Cannot be "new" for navigational reasons*/}
                                <Form.Input label="Short Title" placeholder="For navigation" value={article.id || ''} onChange={updater.change("id")}/>
                                <Form.Field>
                                    <Form.Checkbox toggle label="Published" checked={article.published} onChange={updater.changeToggle("published")}/>
                                </Form.Field>
                                <Form.Group>
                                    <Form.Field>
                                        <label>Creation Time</label>
                                        <DatePicker value={article.created || new Date()} onChange={changeDateTime}/>
                                    </Form.Field>
                                </Form.Group>
                                {/*There was a JS function on this field, onClick*/}
                                <Form.Field>
                                    <label>Tags</label>
                                    <Dropdown fluid multiple selection options={knownTags} value={article.tags || []} onChange={updater.change("tags")}/>
                                </Form.Field>
                                <SuccessMessage message="Changes successfully saved"/>
                                <ErrorMessage message={errorMessage}/>
                            </Grid.Column>
                            <Grid.Column verticalAlign="middle" width={4}>
                                <Button.Group>
                                    <Button primary onClick={submit}>Save</Button>
                                    <Button.Or/>
                                    <Button secondary onClick={reset}>Cancel</Button>
                                </Button.Group>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <Form.Field>
                                    <TextArea label="Content" value={article.content || ''} onChange={updater.change("content")}/>
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
    return `/admin/blog/articles/${articleId}`;
}
