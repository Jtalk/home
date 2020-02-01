import {shallow} from "enzyme";
import {ImageUploadPreview} from "./image-upload-preview";
import {Image} from "semantic-ui-react";
import React from "react";

describe("<ImageUploadPreview/>", () => {
    it('renders null when preview data url is not available', () => {
        let previewDataUrl = undefined;
        let result = shallow(<ImageUploadPreview src={previewDataUrl}/>);
        expect(result.children()).toHaveLength(0);
    });
    it('renders preview when preview data url is available', () => {
        let previewDataUrl = 'some-file-data-url';
        let result = shallow(<ImageUploadPreview src={previewDataUrl} alt={"Image upload preview"}/>);
        expect(result.find(Image).props()).toMatchObject({src: previewDataUrl, alt: "Image upload preview"})
    });
});
