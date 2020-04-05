import React from "react";
import {Divider, Form, Grid, Icon, Image, List, Segment} from "semantic-ui-react";
import {ErrorMessage} from "../form/form-message";
import {
    useFooter,
    useFooterError,
    useFooterLoading,
    useFooterUpdater,
    useFooterUpdating
} from "../data/reduce/footer";
import {useForm} from "./common/use-form";
import {Loading, Updating} from "../data/reduce/global/enums";
import {useLoadedStateChange} from "../utils/state-change";
import {imageUrl} from "../utils/image";
import {Titled} from "react-titled";

let EMPTY_LINK = () => ({caption: '', href: ''});
let EMPTY_LOGO = () => ({name: '', src: ''});

export const EditFooter = function () {

    let footer = useFooter();
    let errorMessage = useFooterError();
    let loading = useFooterLoading();
    let updateStatus = useFooterUpdating();

    let loaded = useLoadedStateChange(loading, {from: Loading.LOADING, to: Loading.READY});
    let updated = useLoadedStateChange(updateStatus, {from: Updating.UPDATING, to: Updating.UPDATED});

    let submit = useFooterUpdater();

    let {updater, data} = useForm({init: footer, autoSubmit: submit, updateStatus});

    let logoAdded = data.logos.length !== footer.logos.length;
    let linkAdded = data.links.length !== footer.links.length;

    if (loaded || updated) {
        updater.reloaded(footer);
    }

    return <Grid centered>
        <Titled title={t => "Edit Footer | " + t}/>
        <Grid.Column width={13}>
            <Segment raised>
                <EditLinks footer={data} {...{submit, updater, updated, linkAdded, errorMessage, updateStatus}}/>
                <Divider/>
                <EditLogos footer={data} {...{submit, updater, updated, logoAdded, errorMessage, updateStatus}}/>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditLogos = function ({errorMessage, updateStatus, footer, updater, updated, logoAdded, submit}) {

    let newLogoForm = useForm({init: EMPTY_LOGO(), updateStatus});

    if (updated && logoAdded) {
        // A new footer has been successfully created
        newLogoForm.updater.reloaded(EMPTY_LOGO());
    }

    let createNewLogo = (logo) => {
        let newFooter = Object.assign({}, footer);
        newFooter.logos = [...newFooter.logos];
        newFooter.logos.push(logo);
        submit(newFooter);
    };

    return <div>
        <Form error={!!errorMessage} success={updateStatus === Updating.UPDATED && !errorMessage}>
            <h2>Edit logos</h2>
            <Form.Input label="New Logo Name" placeholder="A name to show in the <alt/> tag"
                        value={newLogoForm.data.name || ''}
                        onChange={newLogoForm.updater.change("name")}/>
            <Form.Input label="New Logo URL" placeholder="Image source URL"
                        value={newLogoForm.data.src || ''}
                        onChange={newLogoForm.updater.change("src")}/>
            <Form.Input label="New Logo target" placeholder="Target URL"
                        value={newLogoForm.data.href || ''}
                        onChange={newLogoForm.updater.change("href")}/>
            <ErrorMessage message={errorMessage}/>
            <Form.Button primary onClick={newLogoForm.onSubmit(createNewLogo)}>Create</Form.Button>
        </Form>
        <Divider/>
        <List divided relaxed>
            {
                footer.logos.map((logo, i, logos) => {
                    return <List.Item key={logo.name}>
                        <List.Content floated="right">
                            <Icon link={i === 0} name={i === 0 ? "lock" : "up arrow"} onClick={updater.reorder(i, i - 1, "logos")}/>
                            <Icon link={i === logos.length - 1} name={i === logos.length - 1 ? "lock" : "down arrow"} onClick={updater.reorder(i, i + 1, "logos")}/>
                            <Icon link color="red" name="remove" onClick={updater.removeItem(i, "logos")}/>
                        </List.Content>
                        <List.Content>
                            <List.Header as="h3">
                                {logo.name}
                            </List.Header>
                            <List.Description>
                                <Image src={imageUrl(logo.src)} alt={logo.name} href={logo.href}/>
                            </List.Description>
                        </List.Content>
                    </List.Item>
                })
            }
        </List>
    </div>
};

export const EditLinks = function ({errorMessage, updateStatus, footer, updater, updated, linkAdded, submit}) {

    let newLinkForm = useForm({init: EMPTY_LINK(), updateStatus});

    if (updated && linkAdded) {
        // A new footer has been successfully created
        newLinkForm.updater.reloaded(EMPTY_LINK());
    }
    let createNewLink = (link) => {
        let newFooter = Object.assign({}, footer);
        newFooter.links = [...newFooter.links];
        newFooter.links.push(link);
        submit(newFooter);
    };

    return <div>
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
                footer.links.map((link, i, links) => {
                    return <List.Item key={link.caption}>
                        <List.Content floated="right">
                            <Icon link={i === 0} name={i === 0 ? "lock" : "up arrow"}
                                  onClick={updater.reorder(i, i - 1, "links")}/>
                            <Icon link={i === links.length - 1} name={i === links.length - 1 ? "lock" : "down arrow"}
                                  onClick={updater.reorder(i, i + 1, "links")}/>
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
        </List></div>
};