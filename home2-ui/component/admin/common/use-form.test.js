import { act, renderHook } from "@testing-library/react";
import { reportError } from "../../../utils/error-reporting";
import { useForm } from "./use-form";

jest.mock("../../../utils/error-reporting");
reportError.mockImplementation(() => null);

describe("useForm", () => {
  describe("initial state", () => {
    it("initial state without an initial value", () => {
      let { result } = renderHook(() => useForm({}));

      let form = result.current;
      expect(form.data).toEqual({});
      expect(form.edited).toBe(false);
      expect(form.canSubmit).toBe(false);
    });
    it("initial state with an initial value", () => {
      let init = { hello: "world" };
      let { result } = renderHook(() => useForm({ init }));

      let form = result.current;
      expect(form.data).toEqual(init);
      expect(form.edited).toBe(false);
      expect(form.canSubmit).toBe(false);
    });
    it("initial state after reloading", () => {
      const updatedObject = { hello: "world" };

      let { result } = renderHook(useForm);
      act(() => result.current.updater.reload(updatedObject));

      let form = result.current;
      expect(form.data).toEqual(updatedObject);
      expect(form.edited).toBe(false);
      expect(form.submitting).toBe(false);
      expect(form.canSubmit).toBe(false);
    });
  });
  describe("update", () => {
    it("updating a single top level field", () => {
      const updatedValue = "some-value";

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: updatedValue }));

      let form = result.current;
      expect(form.data).toEqual({ testField: updatedValue });
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
    it("updating a single nested field", () => {
      const updatedValue = "some-value";

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("user", "details", "testField")(null, { value: updatedValue }));

      let form = result.current;
      expect(form.data).toEqual({ user: { details: { testField: updatedValue } } });
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
    it("updating multiple fields", () => {
      const updatedValue1 = "some-value1";
      const updatedValue2 = "some-value2";

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: updatedValue1 }));
      act(() => result.current.updater.change("user", "details", "testField")(null, { value: updatedValue2 }));

      let form = result.current;
      expect(form.data).toEqual({ testField: updatedValue1, user: { details: { testField: updatedValue2 } } });
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
    it("updating with file", () => {
      const file = { name: "some-file" };

      let { result } = renderHook(useForm);
      act(() => result.current.updater.changeFile("file")({ target: { files: [file] } }));

      let form = result.current;
      expect(form.data).toEqual({ __files: { file } });
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
    it("updating with multiple files", () => {
      const updatedValue1 = "some-value1";
      const file1 = { name: "some-file" };
      const file2 = { name: "some-file-2" };

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: updatedValue1 }));
      act(() => result.current.updater.changeFile("file1")({ target: { files: [file1] } }));
      act(() => result.current.updater.changeFile("file2")({ target: { files: [file2] } }));

      let form = result.current;
      expect(form.data).toEqual({ testField: updatedValue1, __files: { file1, file2 } });
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
  });
  describe("submit", () => {
    it("refuse submit without prior edits", async () => {
      let submit = jest.fn();
      let { result } = renderHook(useForm);
      await expect(result.current.onSubmit(submit)()).rejects.toEqual(
        new Error(
          "The form is being submitted without any preceding edits, likely a submit button enable/disable screwup"
        )
      );
    });
    it("submit when edited", async () => {
      const updatedValue = "some-value";

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: updatedValue }));

      let submit = jest.fn();
      await act(() => result.current.onSubmit(submit)());

      let form = result.current;
      expect(submit).toHaveBeenCalledWith({ testField: updatedValue }, {});
      // Can still be submitted until the new data arrives via hook args
      expect(form.edited).toBe(true);
      expect(form.canSubmit).toBe(true);
    });
    it("submit with file upload", async () => {
      const file = { name: "some-file" };

      let { result } = renderHook(useForm);
      act(() => result.current.updater.changeFile("file")({ target: { files: [file] } }));

      let submit = jest.fn();
      await act(() => result.current.onSubmit(submit)({}));

      expect(submit).toHaveBeenCalledWith({}, { file });
      // Can still be submitted until the new data arrives via hook args
      expect(result.current.edited).toBe(true);
      expect(result.current.canSubmit).toBe(true);
    });
    it("submit mixed", async () => {
      const updatedValue = "some-value";
      const file = { name: "some-file" };

      let { result } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: updatedValue }));
      act(() => result.current.updater.changeFile("file")({ target: { files: [file] } }));

      let submit = jest.fn();
      await act(() => result.current.onSubmit(submit)());

      expect(submit).toHaveBeenCalledWith({ testField: updatedValue }, { file });
      // Can still be submitted until the new data arrives via hook args
      expect(result.current.edited).toBe(true);
      expect(result.current.canSubmit).toBe(true);
    });
  });
  describe("after submit", () => {
    it("submit success", async () => {
      let { result, rerender } = renderHook(useForm);
      act(() => result.current.updater.change("testField")(null, { value: "some-value" }));

      let resolveLater;
      let submittingPromise = new Promise((resolve) => (resolveLater = resolve));
      let submitting;
      act(() => {
        submitting = result.current.onSubmit(() => submittingPromise)();
      });

      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(true);
      expect(result.current.canSubmit).toBe(false);

      await act(async () => {
        resolveLater(true);
        await submitting;
      });
      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(false);
      expect(result.current.canSubmit).toBe(true);

      rerender({ init: { testField: "some-new-value" } });
      expect(result.current.data).toMatchObject({ testField: "some-new-value" });
      expect(result.current.edited).toBe(false);
      expect(result.current.canSubmit).toBe(false);
    });
    it("submit error and resubmit", async () => {
      let { result, rerender } = renderHook(useForm, { initialProps: {} });
      await act(() => result.current.updater.change("testField")(null, { value: "some-wrong-value" }));

      let failLater;
      let submittingPromise = new Promise((resolve, fail) => (failLater = fail));
      let submitting;
      act(() => {
        submitting = result.current.onSubmit(() => submittingPromise)({});
      });

      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(true);
      expect(result.current.canSubmit).toBe(false);

      await act(async () => {
        failLater(new Error("test error"));
        await submitting;
      });
      expect(result.current.data).toMatchObject({ testField: "some-wrong-value" });
      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(false);
      expect(result.current.canSubmit).toBe(true);

      await act(() => result.current.updater.change("testField")(null, { value: "some-right-value" }));

      let resolveLater;
      submittingPromise = new Promise((resolve) => (resolveLater = resolve));
      let successfulSubmit = jest.fn(() => submittingPromise);
      act(() => {
        submitting = result.current.onSubmit(successfulSubmit)({});
      });

      expect(successfulSubmit).toHaveBeenCalledWith({ testField: "some-right-value" }, {});

      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(true);
      expect(result.current.canSubmit).toBe(false);

      await act(async () => {
        resolveLater(true);
        await submitting;
      });
      expect(result.current.edited).toBe(true);
      expect(result.current.submitting).toBe(false);

      rerender({ init: { testField: "some-new-value" } });
      expect(result.current.data).toMatchObject({ testField: "some-new-value" });
      expect(result.current.edited).toBe(false);
      expect(result.current.canSubmit).toBe(false);
    });
  });
});
