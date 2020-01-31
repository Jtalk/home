import {useState} from "react";
import {useForm} from "./use-form";
import {Updating} from "../../data/reduce/global/enums";
import {UseStateMock} from "../../utils/testing/use-state-mock";

jest.mock("react");

describe("useForm", () => {

    let useStateMock;

    function testUseForm(obj) {
        useStateMock.rerender();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useForm(obj);
    }

    beforeEach(() => {
        useStateMock = new UseStateMock();
        useState.mockImplementation(useStateMock.useState);
    });
    describe("initial state", () => {
        it("initial state without an initial value", () => {
            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({});
            expect(edited).toBe(false);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(false);
        });
        it("initial state with an initial value", () => {
            let init = {hello: "world"};
            let {data, edited, submitting, canSubmit} = testUseForm({init});
            expect(data).toEqual(init);
            expect(edited).toBe(false);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(false);
        });
        it("initial state after reloading", () => {

            const updatedObject = {hello: "world"};

            let {updater} = testUseForm();
            updater.reloaded(updatedObject);

            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual(updatedObject);
            expect(edited).toBe(false);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(false);
        });
    });
    describe("update", () => {
        it("updating a single top level field", () => {

            const updatedValue = "some-value";

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: updatedValue});

            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({testField: updatedValue});
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);
        });
        it("updating a single nested field", () => {

            const updatedValue = "some-value";

            let {updater} = testUseForm();
            updater.change("user", "details", "testField")(null, {value: updatedValue});


            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({user: {details: {testField: updatedValue}}});
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);
        });
        it("updating multiple fields", () => {

            const updatedValue1 = "some-value1";
            const updatedValue2 = "some-value2";

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: updatedValue1});
            // We must re-render the page (another testUseForm call) between changes to mimic React's event handling.
            updater = testUseForm().updater;
            updater.change("user", "details", "testField")(null, {value: updatedValue2});

            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({testField: updatedValue1, user: {details: {testField: updatedValue2}}});
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);
        });
        it("updating with file", () => {

            const file = {name: "some-file"};

            let {updater} = testUseForm();
            updater.changeFile("file")({target: {files: [file]}});

            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({__files: {file}});
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);
        });
        it("updating with multiple files", () => {

            const updatedValue1 = "some-value1";
            const file1 = {name: "some-file"};
            const file2 = {name: "some-file-2"};

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: updatedValue1});
            // We must re-render the page (another testUseForm call) between changes to mimic React's event handling.
            ({updater} = testUseForm());
            updater.changeFile("file1")({target: {files: [file1]}});
            // We must re-render the page (another testUseForm call) between changes to mimic React's event handling.
            ({updater} = testUseForm());
            updater.changeFile("file2")({target: {files: [file2]}});

            let {data, edited, submitting, canSubmit} = testUseForm();
            expect(data).toEqual({testField: updatedValue1, __files: {file1, file2}});
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);
        });
    });
    describe("submit", () => {
        it("refuse submit without prior edits", () => {
            let submit = jest.fn();
            let {onSubmit} = testUseForm();
            expect(() => onSubmit(submit)({})).toThrow(/The form is being submitted without any preceding edits/);
        });
        it("submit when edited", () => {

            const updatedValue = "some-value";

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: updatedValue});

            let submit = jest.fn();
            let {onSubmit} = testUseForm();
            onSubmit(submit)({});

            let {edited, submitting, canSubmit} = testUseForm();
            expect(submit).toHaveBeenCalledWith({testField: updatedValue}, {});
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);
        });
        it("submit with file upload", () => {

            const file = {name: "some-file"};

            let {updater} = testUseForm();
            updater.changeFile("file")({target: {files: [file]}});

            let submit = jest.fn();
            let {onSubmit} = testUseForm();
            onSubmit(submit)({});

            let {edited, submitting, canSubmit} = testUseForm();
            expect(submit).toHaveBeenCalledWith({}, {file});
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);
        });
        it("submit mixed", () => {

            const updatedValue = "some-value";
            const file = {name: "some-file"};

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: updatedValue});
            ({updater} = testUseForm());
            updater.changeFile("file")({target: {files: [file]}});

            let submit = jest.fn();
            let {onSubmit} = testUseForm();
            onSubmit(submit)({});

            let {edited, submitting, canSubmit} = testUseForm();
            expect(submit).toHaveBeenCalledWith({testField: updatedValue}, {file});
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);
        });
    });
    describe("after submit", () => {
        it("submit success", () => {

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: "some-value"});
            let {onSubmit} = testUseForm();
            onSubmit(jest.fn())({});

            let {edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.UPDATING});
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);

            ({edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.UPDATING}));
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);

            // The updates will be visible on the next render
            ({edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.UPDATED}));
            ({edited, submitting, canSubmit} = testUseForm());
            expect(edited).toBe(false);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(false);
        });
        it("submit error and resubmit", () => {

            let {updater} = testUseForm();
            updater.change("testField")(null, {value: "some-wrong-value"});
            let {onSubmit} = testUseForm();
            onSubmit(jest.fn())({});

            let {edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.UPDATING});
            expect(edited).toBe(true);
            expect(submitting).toBe(true);
            expect(canSubmit).toBe(false);

            // The updates will be visible on the next render
            ({edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.ERROR}));
            ({edited, submitting, canSubmit} = testUseForm());
            expect(edited).toBe(true);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(true);

            ({updater} = testUseForm());
            updater.change("testField")(null, {value: "some-right-value"});
            ({onSubmit} = testUseForm());
            let submit = jest.fn();
            onSubmit(submit)({});

            expect(submit).toHaveBeenCalledWith({testField: "some-right-value"}, {});

            // The updates will be visible on the next render
            ({edited, submitting, canSubmit} = testUseForm({updateStatus: Updating.UPDATED}));
            ({edited, submitting, canSubmit} = testUseForm());
            expect(edited).toBe(false);
            expect(submitting).toBe(false);
            expect(canSubmit).toBe(false);

        });
    });
});