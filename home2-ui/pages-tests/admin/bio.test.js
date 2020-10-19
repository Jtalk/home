import React from "react";
import {act} from "react-dom/test-utils";
import Bio, {BioTextArea, EditBioStateless, PhotoUpload} from "../../pages/admin/bio";
import {mount, shallow} from "enzyme";
import {imageUrl} from "../../utils/image";
import {Loading, Updating} from "../../data/reduce/global/enums";
import {Provider as ReduxProvider} from "react-redux";
import {createTestStore} from "../../data/redux";
import {owner as ownerReducer, watchOwner} from "../../data/reduce/owner";
import {ImageUploadPreview} from "../../component/admin/common/image-upload-preview";
import {FileConverterProvider} from "../../utils/file-converter-context";
import {END} from "redux-saga";
import Form from "semantic-ui-react/src/collections/Form";
import TextArea from "semantic-ui-react/src/addons/TextArea";
import Input from "semantic-ui-react/src/elements/Input";
import Button from "semantic-ui-react/src/elements/Button";

describe("<EditBio/>", () => {

    let store;
    let ajaxMock;
    let fileConverter;
    let owner;
    let sagaTask;

    beforeEach(() => {
        owner = {
            name: "Test Owner",
            contacts: {
                email: {value: "test.owner@example.com"}
            }
        };
        ajaxMock = {
            owner: {
                load: jest.fn(() => {
                    console.log("Loading owner for test");
                    return owner;
                }),
                update: jest.fn(updated => updated),
            }
        };
        let rootSaga = function* () {
            yield watchOwner()
        };
        [store, sagaTask] = createTestStore({
            "owner": ownerReducer,
            "ajax": () => ajaxMock
        }, rootSaga);
        sagaTask.toPromise()
            .catch(e => console.log("Error stopping Saga", e))
            .then(() => console.log("Saga successfully stopped"));
        fileConverter = {
            toDataUrl: async file => ({dataUrl: true, file}),
        };
    });
    afterEach(() => {
        store.dispatch(END);
    });
    async function editAndSubmit(wrapper, edit) {
        await act(async () => await edit());
        wrapper.update();
        await act(async () => {
            await wrapper.find(Form).prop("onSubmit")(null);
        });
        wrapper.update();
    }
    it("follows form lifecycle", async () => {
        let result = await mount(
            <ReduxProvider store={store}>
                <FileConverterProvider fileConverter={fileConverter}>
                    <Bio/>
                </FileConverterProvider>
            </ReduxProvider>
        );
        result.update();

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Name"}).at(0).prop("onChange")(null, {value: "New Owner"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith({...owner, name: "New Owner"}, undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "New Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith(Object.assign({}, owner, {
            name: "New Owner", nickname: "New Nickname"
        }), undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        await editAndSubmit(result, async () => {
            result.find(PhotoUpload).prop("onPhotoSelected")({target: {files: [{name: "test photo"}]}});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith({...owner, name: "New Owner", nickname: "New Nickname"}, {name: "test photo"});
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});

        ajaxMock.owner.update.mockImplementationOnce(() => { throw Error("Test I/O Error"); });
        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "Incorrect Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith({...owner, name: "New Owner", nickname: "Incorrect Nickname"}, undefined);
        expect(result.find(Form).props()).toMatchObject({success: false, error: true, loading: false});
        // The incorrect value remained for easier edit
        expect(result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("value")).toEqual("Incorrect Nickname");

        await editAndSubmit(result, async () => {
            result.find(Form.Input).find({label: "Owner Nickname"}).at(0).prop("onChange")(null, {value: "Correct Nickname"});
        });
        expect(ajaxMock.owner.update).toHaveBeenCalledWith({...owner, name: "New Owner", nickname: "Correct Nickname"}, undefined);
        expect(result.find(Form).props()).toMatchObject({success: true, error: false, loading: false});
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
    // config.set({image: {url: {template: "/images/{}"}}});
    it("upload with no prior photo shows input", () => {
        let result = shallow(<PhotoUpload existingPhotoId={undefined} onPhotoSelected={() => {}}/>);
        expect(result.find(Input).find({type: "file"}).exists()).toBe(true);
        expect(result.find(Image).exists()).toBe(false);
    });
    it("upload with prior photo renders the photo and shows input", () => {
        let existingPhotoId = "abc-def";
        let result = shallow(<PhotoUpload existingPhotoId={existingPhotoId} onPhotoSelected={() => {}}/>);
        expect(result.find(Input).find({type: "file"}).exists()).toBe(true);
        expect(result.find(ImageUploadPreview).props()).toMatchObject({src: imageUrl(existingPhotoId), alt: "Owner photo"});
    });
    it("upload with no existing photo triggers the hook upon selection", () => {
        let onSelected = jest.fn(e => {});
        let selectedFileHandle = {name: "test-file"};
        let result = shallow(<PhotoUpload existingPhotoId={undefined} selectedPhotoDataUrl={undefined} onPhotoSelected={onSelected}/>);
        let event = {target: {files: [selectedFileHandle]}};
        result.find(Input).find({type: "file"}).prop("onChange")(event);
        expect(onSelected).toHaveBeenCalledWith(event);
    });
    it("upload with existing photo triggers the hook upon selection", () => {
        let existingPhotoId = "abc-def";
        let onSelected = jest.fn(e => {});
        let selectedFileHandle = {name: "test-file"};
        let result = shallow(<PhotoUpload existingPhotoId={existingPhotoId} selectedPhotoDataUrl={undefined} onPhotoSelected={onSelected}/>);
        let event = {target: {files: [selectedFileHandle]}};
        result.find(Input).find({type: "file"}).prop("onChange")(event);
        expect(onSelected).toHaveBeenCalledWith(event);
    });
    it("upload with already selected photo triggers the hook upon reselection", () => {
        let selectedPhotoDataUrl = "data:url";
        let existingPhotoId = "abc-def";
        let onSelected = jest.fn(e => {});
        let selectedFileHandle = {name: "test-file"};
        let result = shallow(<PhotoUpload existingPhotoId={existingPhotoId} selectedPhotoDataUrl={selectedPhotoDataUrl} onPhotoSelected={onSelected}/>);
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
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loading={Loading.LOADING}/>);
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
        let result = shallow(<EditBioStateless data={owner} updater={updaterMock} loading={Loading.ERROR}/>);
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
