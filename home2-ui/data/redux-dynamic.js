import {useStore} from "react-redux";
import {useMemo} from "react";
import {combineReducers} from "redux";

const modules = {
    articles: () => import("./reduce/articles"),
    authentication: () => import("./reduce/authentication"),
    footer: () => import("./reduce/footer"),
    images: () => import("./reduce/images"),
    "latest-articles": () => import("./reduce/latest-articles"),
    owner: () => import("./reduce/owner"),
    projects: () => import("./reduce/projects"),
    search: () => import("./reduce/search"),
    tags: () => import("./reduce/tags"),
}

export function useReducers(...reducers) {
    const store = useStore();
    useMemo(() => {
        store.replaceReducer(combineReducers(...reducers));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, ...reducers])
}
