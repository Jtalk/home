import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import React from "react";

export function setupErrorReporting() {
    Bugsnag.start({
        apiKey: '899f8865a22e37b078415c92f56dfc5f',
        plugins: [new BugsnagPluginReact(React)],
        releaseStage: "production"
    })
    const ErrorBoundary = Bugsnag.getPlugin('react')
    return {ErrorBoundary};
}

export function reportError(e) {
    try {
        Bugsnag.notify(e);
    } catch (e) {
        console.error("Cannot report error to Bugsnag", e);
    }
}