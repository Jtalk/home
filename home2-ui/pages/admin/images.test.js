import React from 'react';
import {mount, shallow} from "enzyme";
import {act} from "react-dom/test-utils";
import {Button, Card, CardContent, CardDescription, Form, Image, Loader} from "semantic-ui-react";
import {
    EditImagesStateless,
    ImageUpload,
    ImageUploaderWithPreview,
    ImageUploadStateless,
    LoadingViewImages,
    ViewImage,
    ViewImages
} from "./images";
import {MemoryRouter} from "react-router"
import ImageUploader from "../../component/3rdparty/react-image-upload";
import {Pagination} from "../../component/pagination";
import {formatDateTime} from "../../utils/date-time";
import {ErrorMessage} from "../../component/form-message";
import {Loading, Uploading} from "../../data/reduce/global/enums";
import {ImageUploadPreview} from "../../component/admin/common/image-upload-preview";
import {useDataUrl} from "../../utils/file-converter-context";

jest.mock("../../utils/file-converter-context");
useDataUrl.mockImplementation(v => v.dataUrl);

const ownerName = "Test Owner";
const images = [
    {
        id: "abc-def-1",
        description: "A test image 1",
        src: "https://example.com/some-image.png",
        uploadedDateTime: new Date(2018, 11, 6, 13, 35)
    },
    {
        id: "abc-def-2",
        description: "A test image 2",
        src: "https://example.com/some-image1.png",
        uploadedDateTime: new Date(2018, 11, 6, 13, 37)
    },
    {
        id: "abc-def-3",
        description: "A test image 3",
        src: "https://example.com/some-image2.png",
        uploadedDateTime: new Date(2016, 3, 6, 11, 3)
    },
];
const pagination = {
    current: 0,
    total: 2
};

describe("<EditImagesStateless/>", () => {
    it('renders without errors', () => {
        mount(
            <MemoryRouter>
                <EditImagesStateless {...{ownerName, images, pagination}}/>
            </MemoryRouter>
        );
    });
    it('renders without images or pagination', () => {
        mount(
            <MemoryRouter>
                <EditImagesStateless {...{ownerName}} images={[]} pagination={{current: 0, total: 0}}/>
            </MemoryRouter>
        );
    });
    it('renders pagination properly', () => {
        let result = shallow(
            <EditImagesStateless {...{ownerName}} images={[]} page={1} totalCount={3}/>
        );
        let pagination = result.findWhere(n => n.is(Pagination));
        expect(pagination.props()).toMatchObject({current: 1, total: 3});
    });
});


const onDeleteNoop = (e, id) => {};

describe("<LoadingViewImages/>", () => {
    it('renders progress indicator when status not initialised', () => {
        let loadingStatus = undefined;
        let result = shallow(<LoadingViewImages images={[]} loadingStatus={loadingStatus} deleteImage={onDeleteNoop}/>)
        expect(result.find(Loader)).toHaveLength(1);
        expect(result.find(ViewImages).exists()).toBe(false);
    });
    it('renders progress indicator when not ready', () => {
        let loadingStatus = Loading.LOADING;
        let result = shallow(<LoadingViewImages images={[]} loadingStatus={loadingStatus} deleteImage={onDeleteNoop}/>)
        expect(result.find(Loader)).toHaveLength(1);
        expect(result.find(ViewImages).exists()).toBe(false);
    });
    it('renders image viewer when ready', () => {
        let loadingStatus = Loading.READY;
        let result = shallow(<LoadingViewImages images={[]} loadingStatus={loadingStatus} deleteImage={onDeleteNoop}/>)
        expect(result.find(ViewImages)).toHaveLength(1);
        expect(result.find(ViewImages).props()).toMatchObject({images: [], deleteImage: onDeleteNoop});
        expect(result.find(Loader).exists()).toBe(false);
    });
});

describe("<ViewImages/>", () => {
    const testImages = [
        {
            id: "abc-def-egh-1",
            description: "A test image 1",
            src: "https://example.com/some-image.png",
            uploadedDateTime: new Date(2018, 11, 6, 13, 35)
        },
        {
            id: "abc-def-egh-2",
            description: "A test image 2",
            src: "https://example.com/some-image1.png",
            uploadedDateTime: new Date(2018, 11, 6, 13, 37)
        },
        {
            id: "abc-def-egh-3",
            description: "A test image 3",
            src: "https://example.com/some-image2.png",
            uploadedDateTime: new Date(2016, 3, 6, 11, 3)
        },
    ];
    it('renders without errors', () => {
        mount(<ViewImages images={testImages} onDelete={onDeleteNoop}/>);
    });
    it('renders all cards', () => {

        let result = mount(<ViewImages images={testImages} onDelete={onDeleteNoop}/>);

        expect(result.find(Card)).toHaveLength(3);
        expect(result.findWhere(n => n.key() === testImages[0].id).find(ViewImage).exists()).toBe(true);
        expect(result.findWhere(n => n.key() === testImages[1].id).find(ViewImage).exists()).toBe(true);
        expect(result.findWhere(n => n.key() === testImages[2].id).find(ViewImage).exists()).toBe(true);
    });
});

describe("<ViewImage/>", () => {
    const testImage = {
        id: "abc-def-egh",
        description: "A test image 1",
        src: "https://example.com/some-image.png",
        uploadedDateTime: new Date(2018, 11, 6, 13, 35)
    };
    it('renders fully without errors', () => {
        mount(<ViewImage {...testImage} onDelete={onDeleteNoop}/>);
    });
    it('renders underlying entities', () => {

        let result = shallow(<ViewImage {...testImage} onDelete={onDeleteNoop}/>);

        expect(result.find(Image).props()).toMatchObject({src: testImage.src, alt: testImage.description});
        expect(result.find(CardDescription).contains(testImage.description)).toBe(true);
        expect(result.find(CardContent).find({extra: true}).contains(formatDateTime(testImage.uploadedDateTime))).toBe(true);
    });
    it('renders without optional fields', () => {

        let bareImage = Object.assign({}, testImage, {description: undefined, uploadedDateTime: undefined});
        let result = shallow(<ViewImage {...bareImage} onDelete={onDeleteNoop}/>);

        expect(result.find(CardDescription).children().length).toBe(1);
        expect(result.findWhere(n => n.is(CardContent) && n.props()["extra"]).children().length).toBe(0);
    });
    it('propagates Delete button click', () => {
        let onDelete = jest.fn((e, id) => {});
        let result = shallow(<ViewImage {...testImage} deleteImage={onDelete}/>);
        result.find(Button).simulate("click");
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(testImage.id);
    });
});

describe("<ImageUploaderWithPreview/>", () => {
    it('shows preview when file is selected', () => {
        let selectedFile = {dataUrl: "some-selected-file-data-url", name: "test file"};
        let result = shallow(<ImageUploaderWithPreview selectedFile={selectedFile} onFileSelected={() => {}}/>);
        expect(result.find(ImageUploadPreview).props()).toMatchObject({src: selectedFile});
        expect(result.find(ImageUploader).exists()).toBe(false);
    });
    it('shows file uploader when file is not selected', () => {
        let previewDataUrl = undefined;
        let result = shallow(<ImageUploaderWithPreview previewDataUrl={previewDataUrl} onFileSelected={() => {}}/>);
        expect(result.find(ImageUploader).exists()).toBe(true);
        expect(result.find(ImageUploadPreview).exists()).toBe(false);

    });
    it('fires file selection event when file gets selected by the uploader', () => {
        let onSelect = jest.fn(file => {});
        let fileToSelect = 'some-file-handler';
        let result = shallow(<ImageUploaderWithPreview previewDataUrl={undefined} onFileSelected={onSelect}/>);

        result.find(ImageUploader).prop('onChange')([fileToSelect]);
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(fileToSelect);
    });
});

describe("<ImageUploadStateless/>", () => {

    let uploadStatus = undefined;
    let errorMessage = undefined;
    let description = "";
    let setDescription = () => {};
    let selectedFile = undefined;
    let selectFile = () => {};
    let onUploadClick = () => {};

    it('renders upload form by default', () => {
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        expect(result.find(Form).prop("success")).toBeFalsy();
        expect(result.find(Form).prop("error")).toBeFalsy();
        expect(result.find(Form.Input).find({label: "Description", value: description}).exists()).toBe(true);
        expect(result.find(ImageUploaderWithPreview).props()).toMatchObject({selectedFile, onFileSelected: selectFile});
        expect(result.find(Button).find({children: "Upload", primary: true}).exists()).toBe(true);
        expect(result.find(Button.Or).findWhere(n => n.key() === "UploadOr").exists()).toBe(false);
        expect(result.find(Button).find({children: "Cancel", negative: true}).exists()).toBe(false);
    });
    it('renders preview with a cancellation button when file is selected', () => {
        selectedFile = {dataUrl: "some-data-url", name: "test file"};
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        expect(result.find(Form).prop("success")).toBeFalsy();
        expect(result.find(Form).prop("error")).toBeFalsy();
        expect(result.find(Form.Input).find({label: "Description", value: description}).exists()).toBe(true);
        expect(result.find(ImageUploaderWithPreview).props()).toMatchObject({selectedFile, onFileSelected: selectFile});
        expect(result.find(Button).find({children: "Upload", primary: true}).exists()).toBe(true);
        expect(result.find(Button.Or).findWhere(n => n.key() === "UploadOr").exists()).toBe(true);
        expect(result.find(Button).find({children: "Cancel", negative: true}).exists()).toBe(true);
    });
    it('renders description', () => {
        description = "some-description";
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        expect(result.find(Form.Input).find({label: "Description"}).prop("value")).toEqual("some-description");
    });
    it('fires description update after input change', () => {
        description = "old-description";
        setDescription = jest.fn(desc => {});
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        result.find(Form.Input).find({
            label: "Description", value: description
        }).prop("onChange")({}, {value: "new-description"});
        expect(setDescription).toHaveBeenCalledWith("new-description");
    });
    it('fires file selection event after file gets selected', () => {
        selectFile = jest.fn(file => {});
        let newFile = "some-file";
        selectedFile = {dataUrl: "some-selected-file-data-url", name: "test file"};
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        result.find(ImageUploaderWithPreview).prop("onFileSelected")(newFile);
        expect(selectFile).toHaveBeenCalledWith(newFile);
    });
    it('fires upload after button click', () => {
        onUploadClick = jest.fn(() => {});
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        result.find(Button).find({children: "Upload"}).prop("onClick")();
        expect(onUploadClick).toHaveBeenCalledTimes(1);
    });
    it('cancels file selection after cancel button click', () => {
        selectFile = jest.fn(file => {});
        selectedFile = {dataUrl: "some-selected-file-data-url", name: "test file"};
        let result = shallow(<ImageUploadStateless {...{
            uploadStatus, errorMessage, description, setDescription, selectedFile, selectFile, onUploadClick
        }}/>);
        result.find(Button).find({children: "Cancel"}).prop("onClick")();
        expect(selectFile).toHaveBeenCalledWith(null);
    });
});

describe("<ImageUpload/>", () => {

    const expectToBeInImageSelectionState = (result, description = "") => {
        expect(result.find(Form.Field).find({label: "Description"}).prop("value")).toEqual(description);
        expect(result.find(ImageUploader)).toHaveLength(1);
        expect(result.find(ImageUploadPreview).exists()).toBe(false);
        expect(result.find(Button).find({children: "Upload", primary: true}).exists()).toBe(true);
        expect(result.find(Button).find({children: "Cancel", negative: true}).exists()).toBe(false);
    };
    const expectToBeInImageSelectedState = (result, selectedDataUrl, description = "") => {
        expect(result.find(Form.Field).find({label: "Description"}).prop("value")).toEqual(description);
        expect(result.find(ImageUploader).exists()).toBe(false);
        expect(result.find(ImageUploadPreview).prop("src")).toEqual(selectedDataUrl);
        expect(result.find(Button).find({children: "Upload", primary: true}).exists()).toBe(true);
        expect(result.find(Button).find({children: "Cancel", negative: true}).exists()).toBe(true);
    };
    const expectNonSubmittedForm = (result) => {
        expect(result.find(Form).prop("success")).toBeFalsy();
        expect(result.find(Form).prop("error")).toBeFalsy();
    };
    const expectSuccessfulUploadForm = (result) => {
        expect(result.find(Form).prop("success")).toBeTruthy();
        expect(result.find(Form).prop("error")).toBeFalsy();
    };
    const expectFailedUploadForm = (result, errorMessage) => {
        expect(result.find(Form).prop("success")).toBeFalsy();
        expect(result.find(Form).prop("error")).toBeTruthy();
        expect(result.find(ErrorMessage).prop("message")).toEqual(errorMessage);
    };

    it('renders upload form by default', () => {
        let result = mount(<ImageUpload uploadStatus={undefined} errorMessage={undefined} uploadImage={() => {}}/>);
        expectNonSubmittedForm(result);
        expectToBeInImageSelectionState(result);
    });
    it('switches to preview when image is selected, then reverts when cancelled', async () => {

        let result = mount(<ImageUpload uploadStatus={undefined} errorMessage={undefined} uploadImage={() => {}}/>);
        let fileSelected = {name: "some-file", dataUrl: "some-data-url"};
        await act(async () => {
            result.find(ImageUploader).prop("onChange")([fileSelected]);
        });
        result.update();

        expectNonSubmittedForm(result);
        expectToBeInImageSelectedState(result, fileSelected);

        await act(async () => {
            result.find(Button).find({children: "Cancel"}).simulate('click');
        });
        result.update();

        expectNonSubmittedForm(result);
        expectToBeInImageSelectionState(result);
    });
    it('switches to preview when image is selected, then triggers upload when confirmed, then resets fields when uploaded', async () => {

        let uploadImage = jest.fn(({description, file}) => {});
        let result = mount(<ImageUpload uploadStatus={undefined} errorMessage={undefined} uploadImage={uploadImage}/>);
        let selectedFile = {name: "some-file", dataUrl: "some-data-url"};
        let description = "some-description";
        await act(async () => {
            result.find(ImageUploader).prop("onChange")([selectedFile]);
            result.find(Form.Field).find({label: "Description"}).prop("onChange")(null, {value: description});
        });
        result.update();

        expectNonSubmittedForm(result);
        expectToBeInImageSelectedState(result, selectedFile, description);

        await act(async () => {
            result.find(Button).find({children: "Upload"}).simulate('click');
        });
        result.update();

        expect(uploadImage).toHaveBeenCalledWith({description, file: selectedFile});
        result.setProps({uploadStatus: Uploading.UPLOADING});
        result.setProps({uploadStatus: Uploading.UPLOADED});

        expectSuccessfulUploadForm(result);
        // We don't reset description to support incrementing-number values for multiple uploads, e.g. having it like
        // - image-for-articleN-1
        // - image-for-articleN-2
        // - image-for-articleN-3
        expectToBeInImageSelectionState(result, description);
    });
    it('switches to preview when image is selected, then triggers upload when confirmed, then fields remain when upload failed', async () => {

        let uploadImage = jest.fn(({description, file}) => {});
        let result = mount(<ImageUpload uploadStatus={undefined} errorMessage={undefined} uploadImage={uploadImage}/>);
        let selectedFile = {name: "some-file", dataUrl: "some-data-url"};
        let description = "some-description";
        await act(async () => {
            result.find(ImageUploader).prop("onChange")([selectedFile]);
            result.find(Form.Field).find({label: "Description"}).prop("onChange")(null, {value: description});
        });
        result.update();

        expectNonSubmittedForm(result);
        expectToBeInImageSelectedState(result, selectedFile, description);

        await act(async () => {
            result.find(Button).find({children: "Upload"}).simulate('click');
        });
        result.update();

        let uploadErrorMessage = "API not available";

        expect(uploadImage).toHaveBeenCalledWith({description, file: selectedFile});
        result.setProps({uploadStatus: Uploading.UPLOADING});
        result.setProps({uploadStatus: Uploading.ERROR, errorMessage: uploadErrorMessage});

        expectFailedUploadForm(result, uploadErrorMessage);
        expectToBeInImageSelectedState(result, selectedFile, description);
    });
});
