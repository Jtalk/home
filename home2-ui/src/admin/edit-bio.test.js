import React from "react";
import {BioTextArea, PhotoUpload} from "./edit-bio";
import {shallow} from "enzyme";
import {Input, Image, TextArea} from "semantic-ui-react";
import {imageUrl} from "../utils/image";
import config from "react-global-configuration";

describe("<BioTextArea/>", () => {
    it("shows existing bio", () => {
        let bio = "some text...";
        let result = shallow(<BioTextArea bio={bio} onBioChange={() => {}}/>);
        expect(result.find(TextArea).prop("value")).toEqual(bio);
    });
    it("shows empty text if no bio", () => {
        let bio = undefined;
        let result = shallow(<BioTextArea bio={bio} onBioChange={() => {}}/>);
        expect(result.find(TextArea).prop("value")).toEqual("");
    });
    it("reports input if already set", () => {
        let onChange = jest.fn((e, {name, value}) => {});
        let bio = "some text...";
        let result = shallow(<BioTextArea bio={bio} onBioChange={onChange}/>);
        let event = {};
        let payload = {name: "mybio", value: "some new text..."};
        result.find(TextArea).prop("onChange")(event, payload);
        expect(onChange).toHaveBeenCalledWith(event, payload);
    });
    it("reports input if not already set", () => {
        let onChange = jest.fn((e, {name, value}) => {});
        let bio = undefined;
        let result = shallow(<BioTextArea bio={bio} onBioChange={onChange}/>);
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