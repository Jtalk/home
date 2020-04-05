import {routeConcat} from "./active-route-context";

describe("routeConcat", () => {
    it("works on minimal example", () => {
        let result = routeConcat("/", "");
        expect(result).toEqual("/");
    });
    it("works with a head / in the second part", () => {
        let result = routeConcat("/hello", "/world");
        expect(result).toEqual("/hello/world");
    });
    it("works without a head / in the second part", () => {
        let result = routeConcat("/hello", "world");
        expect(result).toEqual("/hello/world");
    });
    it("works on multiple slashes", () => {
        let result = routeConcat("/", "/hello", "/", "/world", "///");
        expect(result).toEqual("/hello/world/");
    });
});