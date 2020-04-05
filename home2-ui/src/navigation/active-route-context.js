import React, {createContext, useContext} from "react";
import {useRouteMatch} from "react-router-dom";

const ActiveRouteContext = createContext();

export const ActiveRouteProvider = function ({routeSoFar, children}) {
    return <ActiveRouteContext.Provider value={routeSoFar}>
        {children}
    </ActiveRouteContext.Provider>
};

export function useActiveRoute(currentSegment = "") {
    let routeSoFar = useContext(ActiveRouteContext) || "/";
    let path = currentSegment || "";
    return routeConcat(routeSoFar, path);
}

export function useCurrentRouteMatch(currentRoute, exact) {
    let match = useRouteMatch(currentRoute);
    return match && (!exact || match.isExact)
}

export function routeConcat(...parts) {
    return parts.join("/").replace(/\/[/]+/g, "/");
}