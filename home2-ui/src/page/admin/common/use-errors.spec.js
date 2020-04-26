import {FormErrors} from "./use-errors";

describe("useFormErrors", () => {
    it("should report no errors when empty", () => {
        let instance = new FormErrors();
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
    });
    it("should report error when reported", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "path")).toBe(false);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
    });
    it("should report multiple unique errors when reported", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.report("Another Error")("another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error, Another Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "test", "path")).toBe("Another Error");
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should report error when reported through for", () => {
        let instance = new FormErrors();

        instance.report("Test Error").for("test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should report error when reported through for for multiple paths", () => {
        let instance = new FormErrors();

        instance.report("Test Error")
            .for("test", "path")
            .for("another", "test", "path")
            .for("another", "another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.hasErrors("another", "another", "test", "path")).toBe(true);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "another", "test", "path")).toBe("Test Error");
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should report error when validation fails", () => {
        let instance = new FormErrors();

        instance.validate(false, "Test Error")("test", "path");
        instance.validate(false, "Another Error")("another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error, Another Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.hasErrors("another", "path")).toBe(false);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "test", "path")).toBe("Another Error");
    });
    it("should report error when validation fails for multiple fields through for", () => {
        let instance = new FormErrors();

        instance.validate(false, "Test Error")
            .for("test", "path")
            .for("another", "test", "path")
            .for("another", "another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.hasErrors("another", "another", "test", "path")).toBe(true);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "another", "test", "path")).toBe("Test Error");
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should report no error when validation succeeds", () => {

        let instance = new FormErrors();

        instance.validate(true, "Test Error")("test", "path");
        instance.validate(true, "Test Error")("another", "test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
    });
    it("should report no error when validation succeeds with for", () => {

        let instance = new FormErrors();

        instance.validate(true, "Test Error")
            .for("test", "path")
            .for("another", "test", "path")
            .for("another", "another", "test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
        expect(instance.hasErrors("another", "another", "test", "path")).toBe(false);
    });
    it("should reset error after validation succeeds having failed", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.validate(true, "Test Error")("test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
    });
    it("should reset multiple errors after validation succeeds having failed", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.validate(false, "Another Error")("another", "test", "path");
        instance.validate(true, "Test Error")("test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Another Error");
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.errorFor("another", "test", "path")).toBe("Another Error");

        instance.validate(true, "Another Error")("another", "test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
    });
    it("should reset error with for after validation succeeds having failed", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.validate(true, "Test Error").for("test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
    });
    it("should reset multiple errors with for after validation succeeds having failed", () => {
        let instance = new FormErrors();

        instance.report("Test Error")
            .for("test", "path")
            .for("another", "another", "test", "path");
        instance.validate(true, "Test Error")
            .for("test", "path")
            .for("another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
        expect(instance.hasErrors("another", "another", "test", "path")).toBe(true);
        expect(instance.errorFor("another", "another", "test", "path")).toBe("Test Error");

        instance.validate(true, "Test Error")
            .for("test", "path")
            .for("another", "another", "test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "test", "path")).toBe(false);
        expect(instance.hasErrors("another", "another", "test", "path")).toBe(false);
    });
    it("should report no errors after reset", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.reset("test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should allow multiple resets", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.reset("test", "path");
        instance.reset("test", "path");
        instance.reset("test", "path");
        instance.reset("test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should report no errors after multiple errors are reset", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.report("Another Error")("another", "test", "path");
        instance.reset("test", "path");
        instance.reset("another", "test", "path");
        expect(instance.hasErrors()).toBe(false);
        expect(instance.message).toBeFalsy();
        expect(instance.hasErrors("test", "path")).toBe(false);
        expect(instance.hasErrors("another", "path")).toBe(false);
    });
    it("should still report remaining errors after partially reset", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.report("Another Error")("another", "test", "path");
        instance.reset("another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "path")).toBe(false);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
    });
    it("should report errors again after reset and repopulated", () => {
        let instance = new FormErrors();

        instance.report("Test Error")("test", "path");
        instance.report("Another Error")("another", "test", "path");
        instance.reset("another", "test", "path");
        instance.report("Another Error 2")("another", "test", "path");
        expect(instance.hasErrors()).toBe(true);
        expect(instance.message).toBe("Test Error, Another Error 2");
        expect(instance.hasErrors("test", "path")).toBe(true);
        expect(instance.hasErrors("another", "test", "path")).toBe(true);
        expect(instance.errorFor("test", "path")).toBe("Test Error");
        expect(instance.errorFor("another", "test", "path")).toBe("Another Error 2");
    });
});