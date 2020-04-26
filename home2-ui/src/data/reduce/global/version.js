import {useImmutableSelector} from "../../redux-store";

export function useVersion(segment, path = ["version"]) {
    return useImmutableSelector(segment, ...path);
}

export function upVersion(state) {
    let existing = state.get("version") || 0;
    return existing + 1;
}