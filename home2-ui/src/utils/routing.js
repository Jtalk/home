import {Route} from "react-router";
import React from "react";
import assert from "assert";

export function createRoutingConfig(path, render, exact = false) {
    return {path: path, render: render, exact: exact};
}

export function createMultiRoutingConfig(routingConfigs) {
    assert(routingConfigs.length > 0, "Cannot create milti-route config with 0 routes");
    return {routes: routingConfigs};
}

export function createRoutes(routingConfig) {
    if (Array.isArray(routingConfig.routes)) {
        assert(routingConfig.routes.length > 0, "Empty routes list in a multi-route config");
        return routingConfig.routes.map(createSingleRoute);
    } else {
        return [createSingleRoute(routingConfig)];
    }
}

function createSingleRoute(routingConfig) {
    return <Route key={routingConfig.path}
                  render={routingConfig.render}
                  path={routingConfig.path}
                  exact={routingConfig.exact}/>
}