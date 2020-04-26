import {shallow} from "enzyme";
import {ImageUploadPreview} from "./image-upload-preview";
import {useDataUrl} from "../../../utils/file-converter-context";
import React from "react";
import {OptionalImage} from "../../../component/image";

jest.mock("../../../utils/file-converter-context");
useDataUrl.mockImplementation(v => v);

describe("<ImageUploadPreview/>", () => {
    it('renders null when preview data url is not available', () => {
        let previewDataUrl = undefined;
        let result = shallow(<ImageUploadPreview src={previewDataUrl}/>);
        expect(result.children()).toHaveLength(0);
    });
    it('renders preview when preview data url is available', () => {
        let previewDataUrl = 'some-file-data-url';
        let result = shallow(<ImageUploadPreview src={previewDataUrl} alt={"Image upload preview"}/>);
        expect(result.find(OptionalImage).props()).toMatchObject({src: previewDataUrl, alt: "Image upload preview"})
    });
});
