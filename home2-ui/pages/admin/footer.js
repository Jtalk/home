import React, {useMemo} from "react";
import {useForm} from "../../component/admin/common/use-form";
import {Loading, Updating} from "../../data/reduce/global/enums";
import {OwnerTitled} from "../../component/about/owner-titled";
import {ErrorMessage} from "../../component/message/error-message";
import {
    useFooter,
    useFooterError,
    useFooterLoading,
    useFooterUpdater,
    useFooterUpdating
} from "../../data/reduce/footer/hooks";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Image from "semantic-ui-react/dist/commonjs/elements/Image";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import List from "semantic-ui-react/dist/commonjs/elements/List";
import LazyIcon from "../../component/lazy-icon";
import {useReducers} from "../../data/redux-dynamic";
import ownerReducer from "../../data/reduce/owner";
import latestArticlesReducer from "../../data/reduce/latest-articles";
import authenticationReducer from "../../data/reduce/authentication";
import searchReducer from "../../data/reduce/search";
import footerReducer from "../../data/reduce/footer";
import articlesReducer from "../../data/reduce/articles";

let EMPTY_LINK = () => ({caption: '', href: ''});
let EMPTY_LOGO = () => ({name: '', src: ''});

export default function Footer() {

    useReducers(ownerReducer, latestArticlesReducer, authenticationReducer, searchReducer, footerReducer, articlesReducer);

    let footer = useFooter();
    let errorMessage = useFooterError();
    let loading = useFooterLoading();
    let updating = useFooterUpdating();

    let submit = useFooterUpdater();

    let {updater, data} = useForm({init: footer, autoSubmit: submit});

    return <Grid centered>
        <OwnerTitled title={"Edit Footer"}/>
        <Grid.Column width={13}>
            <Segment raised>
                <EditLinks footer={data} {...{submit, updater, loading, updating, errorMessage}}/>
                <Divider/>
                <EditLogos footer={data} {...{submit, updater, loading, updating, errorMessage}}/>
            </Segment>
        </Grid.Column>
    </Grid>
};

export const EditLogos = function ({errorMessage, loading, updating, footer, updater, submit}) {

    let emptyLogo = useMemo(EMPTY_LOGO, [footer]);
    let newLogoForm = useForm({init: emptyLogo});

    let createNewLogo = (logo) => submit({...footer, logos: [...footer.logos, logo]});

    return <div>
        <Form error={loading === Loading.ERROR || updating === Updating.ERROR} success={updating === Updating.UPDATED}>
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
                            <LazyIcon link={i === 0} name={i === 0 ? "lock" : "up arrow"}
                                  onClick={updater.reorder(i, i - 1, "logos")}/>
                            <LazyIcon link={i === logos.length - 1} name={i === logos.length - 1 ? "lock" : "down arrow"}
                                  onClick={updater.reorder(i, i + 1, "logos")}/>
                            <LazyIcon link color="red" name="remove" onClick={updater.removeItem(i, "logos")}/>
                        </List.Content>
                        <List.Content>
                            <List.Header as="h3">
                                {logo.name}
                            </List.Header>
                            <List.Description>
                                <Image src={logo.src} alt={logo.name} href={logo.href}/>
                            </List.Description>
                        </List.Content>
                    </List.Item>
                })
            }
        </List>
    </div>
};

export const EditLinks = function ({errorMessage, updating, loading, footer, updater, submit}) {

    let emptyLink = useMemo(EMPTY_LINK, [footer]);
    let newLinkForm = useForm({init: emptyLink});

    let createNewLink = (link) => {
        let newFooter = {...footer};
        newFooter.links = [...newFooter.links, link];
        submit(newFooter);
    };

    return <div>
        <h1>Edit Footer</h1>
        <Divider/>
        <Form error={updating === Updating.ERROR || loading === Loading.ERROR} success={updating === Updating.UPDATED}>
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
                            <LazyIcon link={i === 0} name={i === 0 ? "lock" : "up arrow"}
                                  onClick={updater.reorder(i, i - 1, "links")}/>
                            <LazyIcon link={i === links.length - 1} name={i === links.length - 1 ? "lock" : "down arrow"}
                                  onClick={updater.reorder(i, i + 1, "links")}/>
                            <LazyIcon link color="red" name="remove" onClick={updater.removeItem(i, "links")}/>
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
