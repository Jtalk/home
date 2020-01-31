import {useState} from "react";
import {useImmutableSelector} from "./redux-store";
import {UseStateMock} from "./testing/use-state-mock";
import {useStateChange} from "./state-change";

jest.mock("react");
jest.mock("./redux-store");

describe("useStateChange", () => {

    let segment = "test";
    let path = ["v1", "values"];

    let useStateMock;
    let useImmutableSelectorMock;

    function testUseStateChange(segment, path, desc) {
        useStateMock.rerender();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useStateChange(segment, path, desc);
    }

    beforeEach(() => {
        useStateMock = new UseStateMock();
        useImmutableSelectorMock = jest.fn((segment, path) => undefined);
        useState.mockImplementation(useStateMock.useState);
        useImmutableSelector.mockImplementation(useImmutableSelectorMock);
    });
    it("misconfigured from returns error", () => {
        expect(() => testUseStateChange(segment, path, {to: "target"})).toThrow("from & to cannot be undefined");
    });
    it("misconfigured to returns error", () => {
        expect(() => testUseStateChange(segment, path, {from: "source"})).toThrow("from & to cannot be undefined");
    });
    it("misconfigured both returns error", () => {
        expect(() => testUseStateChange(segment, path, {})).toThrow("from & to cannot be undefined");
    });
    it("reacts to change of state", () => {

        useImmutableSelector.mockReturnValue("from");
        let [triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"});
        expect(state).toEqual("from");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("interim");
        ([triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"}));
        expect(state).toEqual("interim");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("almost");
        ([triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"}));
        expect(state).toEqual("almost");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("to");
        ([triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"}));
        expect(state).toEqual("to");
        expect(triggered).toBe(true);

        useImmutableSelector.mockReturnValue("to");
        ([triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"}));
        expect(state).toEqual("to");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("beyond to");
        ([triggered, state] = testUseStateChange(segment, path, {from: "almost", to: "to"}));
        expect(state).toEqual("beyond to");
        expect(triggered).toBe(false);
    });

    it("reacts to complex change of state", () => {

        useImmutableSelector.mockReturnValue("from");
        let [triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]});
        expect(state).toEqual("from");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("interim");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("interim");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("almost");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("almost");
        expect(triggered).toBe(true);

        useImmutableSelector.mockReturnValue("almost");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("almost");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("to");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("to");
        expect(triggered).toBe(true);

        useImmutableSelector.mockReturnValue("to");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("to");
        expect(triggered).toBe(false);

        useImmutableSelector.mockReturnValue("beyond to");
        ([triggered, state] = testUseStateChange(segment, path, {from: ["almost", "interim"], to: ["almost", "to"]}));
        expect(state).toEqual("beyond to");
        expect(triggered).toBe(false);
    });
});