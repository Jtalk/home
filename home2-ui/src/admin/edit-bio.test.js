import React from "react";
import {act} from "react-dom/test-utils";
import {BioTextArea, EditBio, EditBioStateless, PhotoUpload} from "./edit-bio";
import {mount, shallow} from "enzyme";
import {Button, Form, Image, Input, TextArea} from "semantic-ui-react";
import {imageUrl} from "../utils/image";
import config from "react-global-configuration";
import {Loading, Updating} from "../data/reduce/global/enums";
import {AjaxProvider} from "../context/ajax-context";
import {Provider as ReduxProvider} from "react-redux";
import {createTestStore} from "../data/redux";
import {owner as ownerReducer} from "../data/reduce/owner";

describe("<EditBio/>", () => {

    let store;
    let ajaxMock;
    let owner;

    beforeEach(() => {
        store = createTestStore("owner", ownerReducer);
        ajaxMock = {
            owner: {
                load: jest.fn(() => owner),
                update: jest.fn(updated => updated),
            }
        };
        owner = {
            name: "Test Owner",
            contacts: {
                email: {value: "test.owner@example.com"}
            }
        };
    });
    async function editAndSubmit(wrapper, edit) {
        await act(async () => {
            edit();
        });
        wrapper.update();
        await act(async () => {
            wrapper.find(Form).prop("onSubmit")(null);
        });
        wrapper.update();
    }
    it("follows form lifecycle", async () => {
        let result = await mount(
            <AjaxProvider ajax={ajaxMock}>
                <ReduxProvider store={store}>
                    <EditBio/>
                </ReduxProvider>
            </AjaxProvider>
        );
        result.update();

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Name"}).at(0).prop("onChange")(null, {value: "New Owner"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {name: "New Owner"}), undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "New Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {name: "New Owner", nickname: "New Nickname"}), undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        await editAndSubmit(result, async () => {
            result.find(PhotoUpload).prop("onPhotoSelected")({target: {files: [{name: "test photo"}]}});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {name: "New Owner", nickname: "New Nickname"}), {name: "test photo"});
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        ajaxMock.owner.update.mockImplementationOnce(() => { throw Error("Test I/O Error"); });
        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "Incorrect Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {name: "New Owner", nickname: "Incorrect Nickname"}), undefined);
        expect(result.find(Form).props()).toMatchObject({success: false, error: true, loading: false});
        // The incorrect value remained for easier edit
        expect(result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("value")).toEqual("Incorrect Nickname");

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "Correct Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {name: "New Owner", nickname: "Correct Nickname"}), undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});
        // The incorrect value remained for easier edit
        expect(result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("value")).toEqual("Correct Nickname");
    });
});

describe("<BioTextArea/>", () => {
    it("shows existing bio", () => {
        let bio = "some text...";
        let result = shallow(<BioTextArea bio={bio} onChange={() => {}}/>);
        expect(result.find(TextArea).prop("value")).toEqual(bio);
    });
    it("reports input if already set", () => {
        let onChange = jest.fn((e, {name, value}) => {});
        let bio = "some text...";
        let result = shallow(<BioTextArea bio={bio} onChange={onChange}/>);
        let event = {};
        let payload = {name: "mybio", value: "some new text..."};
        result.find(TextArea).prop("onChange")(event, payload);
        expect(onChange).toHaveBeenCalledWith(event, payload);
    });
    it("reports input if not already set", () => {
        let onChange = jest.fn((e, {name, value}) => {});
        let bio = undefined;
        let result = shallow(<BioTextArea bio={bio} onChange={onChange}/>);
        let event = {};
        let payload = {name: "mybio", value: "some new text..."};
        result.find(TextArea).prop("onChange")(event, payload);
        expect(onChange).toHaveBeenCalledWith(event, payload);
    });
});

describe("<PhotoUpload/>", () => {
    config.set({image: {url: {template: "/images/{}"}}});
    it("upload with no prior photo shows input", () => {
        let result = shallow(<PhotoUpload existingPhotoId={undefined} onPhotoSelected={() => {}}/>);
        expect(result.find(Input).find({type: "file"}).exists()).toBe(true);
        expect(result.find(Image).exists()).toBe(false);
    });
    it("upload with prior photo renders the photo and shows input", () => {
        let existingPhotoId = "abc-def";
        let result = shallow(<PhotoUpload existingPhotoId={existingPhotoId} onPhotoSelected={() => {}}/>);
        expect(result.find(Input).find({type: "file"}).exists()).toBe(true);
        expect(result.find(Image).props()).toMatchObject({src: imageUrl(existingPhotoId), alt: "Owner photo"});
    });
    it("upload with no prior photo triggers upload upon selection", () => {
        let onSelected = jest.fn(e => {});
        let selectedFileHandle = {name: "test-file"};
        let result = shallow(<PhotoUpload existingPhotoId={undefined} onPhotoSelected={onSelected}/>);
        let event = {target: {files: [selectedFileHandle]}};
        result.find(Input).find({type: "file"}).prop("onChange")(event);
        expect(onSelected).toHaveBeenCalledWith(event);
    });
    it("upload with prior photo triggers upload upon selection", () => {
        let existingPhotoId = "abc-def";
        let onSelected = jest.fn(e => {});
        let selectedFileHandle = {name: "test-file"};
        let result = shallow(<PhotoUpload existingPhotoId={existingPhotoId} onPhotoSelected={onSelected}/>);
        let event = {target: {files: [selectedFileHandle]}};
        result.find(Input).find({type: "file"}).prop("onChange")(event);
        expect(onSelected).toHaveBeenCalledWith(event);
    });
});

describe("<EditBioStateless/>", () => {
    let owner = {
        name: "Test Guy",
        nickname: "testguy1",
        contacts: {
            email: {value: "testguy@example.com"}
        },
        description: "Some test guy",
        photoId: "test-photo-id",
        bio: "Test guy's bio",
    };
    let updaterMock = {
        change: jest.fn(),
        changeFile: jest.fn(),
    };
    it("renders form", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loadingStatus={Loading.READY}/>);

        expect(result.find(Form).props()).toMatchObject({loading: false, success: false, error: false});
        expect(result.find(Form.Input).exists()).toBe(true);
        expect(result.find(PhotoUpload).props()).toMatchObject({existingPhotoId: owner.photoId});
        expect(result.find(BioTextArea).props()).toMatchObject({bio: owner.bio});
        expect(result.find(Button).props()).toMatchObject({primary: true, type: "submit", disabled: true});
    });
    it("renders form with default data if missing", () => {
        let owner = {};

        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loadingStatus={Loading.READY}/>);

        expect(result.find(Form).props()).toMatchObject({loading: false, success: false, error: false});
        expect(result.find(Form.Input).find({label: "Owner Name"}).props()).toMatchObject({value: ""});
        expect(result.find(Form.Input).find({label: "Owner Nickname"}).props()).toMatchObject({value: ""});
        expect(result.find(Form.Input).find({label: "Owner E-Mail"}).props()).toMatchObject({value: ""});
        expect(result.find(Form.Input).find({label: "Owner Short Bio"}).props()).toMatchObject({value: ""});
        expect(result.find(PhotoUpload).props()).toMatchObject({existingPhotoId: undefined});
        expect(result.find(BioTextArea).props()).toMatchObject({bio: ""});
        expect(result.find(Button).props()).toMatchObject({primary: true, type: "submit"});
    });
    it("renders form with loading indicator", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loadingStatus={Loading.LOADING}/>);
        expect(result.find(Form).props()).toMatchObject({loading: true, success: false, error: false});
    });
    it("renders form with success message", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} updateStatus={Updating.UPDATED}/>);
        expect(result.find(Form).props()).toMatchObject({loading: false, success: true, error: false});
    });
    it("renders form with error message if cannot be updated", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} updateStatus={Updating.ERROR}/>);
        expect(result.find(Form).props()).toMatchObject({loading: false, success: false, error: true});
    });
    it("renders form with error message if cannot be loaded", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loadingStatus={Loading.ERROR}/>);
        expect(result.find(Form).props()).toMatchObject({loading: false, success: false, error: true});
    });
    it("triggers updates to the supplied updater", () => {
        updaterMock.change.mockImplementation((...name) => ({updaterName: name}));
        updaterMock.changeFile.mockImplementation(name => ({photoUpdaterName: name}));
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock}/>);

        expect(result.find(Form.Input).find({label: "Owner Name"}).props()).toMatchObject({onChange: {updaterName: ["name"]}});
        expect(result.find(Form.Input).find({label: "Owner Nickname"}).props()).toMatchObject({onChange: {updaterName: ["nickname"]}});
        expect(result.find(Form.Input).find({label: "Owner E-Mail"}).props()).toMatchObject({onChange: {updaterName: ["contacts", "email", "value"]}});
        expect(result.find(Form.Input).find({label: "Owner Short Bio"}).props()).toMatchObject({onChange: {updaterName: ["description"]}});
        expect(result.find(PhotoUpload).props()).toMatchObject({onPhotoSelected: {photoUpdaterName: "photo"}});
        expect(result.find(BioTextArea).props()).toMatchObject({onChange: {updaterName: ["bio"]}});
    });
    it("can be submitted", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} canSubmit={true}/>);
        expect(result.find(Button).find({primary: true}).props()).toMatchObject({disabled: false});
    });
    it("button is disabled if cannot submit", () => {
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} canSubmit={false}/>);
        expect(result.find(Button).find({primary: true}).props()).toMatchObject({disabled: true});
    });
});