import React from "react";
import {Divider, Form, Grid, Icon, List, Segment} from "semantic-ui-react";
import {ErrorMessage} from "../form/form-message";
import {useAjax, useAjaxLoader} from "../context/ajax-context";
import {load, update} from "../data/reduce/footer";
import {useDispatch} from "react-redux";
import {useImmutableSelector} from "../utils/redux-store";
import {useForm} from "./common/use-form";
import {Loading, Updating} from "../data/reduce/global/enums";
import {useStateChange} from "../utils/state-change";

let EMPTY_LINK = () => ({caption: '', href: ''});

export const EditFooter = function () {

    useAjaxLoader(load);

    let ajax = useAjax();
    let dispatch = useDispatch();

    let footer = useImmutableSelector("footer", "data");
    let errorMessage = useImmutableSelector("footer", "errorMessage");
    let [loaded, loadingStatus] = useStateChange("footer", ["loading"], {from: Loading.LOADING, to: Loading.READY});
    let [updated, updateStatus] = useStateChange("footer", ["updating"], {from: Updating.UPDATING, to: Updating.UPDATED});

    let submit = (updated) => {
        dispatch(update(ajax, updated));
    };

    let {updater, data} = useForm({init: footer, autoSubmit: submit, updateStatus});
    let newLinkForm = useForm({init: EMPTY_LINK(), updateStatus});

    if (updated && data.links.length !== footer.links.length) {
        // A new footer has been successfully created
        newLinkForm.updater.reloaded(EMPTY_LINK());
    }
    if (loaded || updated) {
        updater.reloaded(footer);
    }

    let createNewLink = (link) => {
        let newFooter = Object.assign({}, data);
        newFooter.links = [...newFooter.links];
        newFooter.links.push(link);
        submit(newFooter);
    };

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <h1>Edit Footer</h1>
                <Divider/>
                <Form error={!!errorMessage} success={updateStatus === Updating.UPDATED && !errorMessage}>
                    <h2>Edit links</h2>
                    <Form.Input label="New Link Caption" placeholder="A text to show for this link"
                                value={newLinkForm.data.caption || ''}
                                onChange={newLinkForm.updater.change("caption")}/>
                    <Form.Input label="New Link URL" placeholder="URL"
                                value={newLinkForm.data.href || ''}
                                onChange={newLinkForm.updater.change("href")}/>
                    <ErrorMessage message={errorMessage}/>
                    <Form.Button primary onClick={newLinkForm.onSubmit(createNewLink)}>Create</Form.Button>
                </Form>
                <Divider/>
                <List divided relaxed>
                    {
                        data.links.map((link, i, links) => {
                            return <List.Item key={link.caption}>
                                <List.Content floated="right">
                                    <Icon link={i === 0} name={i === 0 ? "lock" : "up arrow"} onClick={updater.reorder(i, i - 1, "links")}/>
                                    <Icon link={i === links.length - 1} name={i === links.length - 1 ? "lock" : "down arrow"} onClick={updater.reorder(i, i + 1, "links")}/>
                                    <Icon link color="red" name="remove" onClick={updater.removeItem(i, "links")}/>
                                </List.Content>
                                <List.Content>
                                    <List.Header as="h3">
                                        {link.caption}
                                    </List.Header>
                                    <List.Description>
                                        {link.href}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        })
                    }
                </List>
            </Segment>
        </Grid.Column>
    </Grid>
};
