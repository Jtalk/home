import {useImmutableSelector} from "../../redux-store";
import {Action, segment} from "./index";
import {useMemo} from "react";
import {action} from "../global/actions";
import {useLoader} from "../global/hook-barebone";

export function useAvailableTags() {
    let tags = useImmutableSelector(segment, "data");
    let loadAction = useMemo(() => action(Action.LOAD), []);
    useLoader(loadAction, !tags);
    return tags || [];
}
