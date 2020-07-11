import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import React from "react";
import {BasicErrorBoundary} from "./basic-error-boundary";

const APP_VERSION = process.env.REACT_APP_VERSION || undefined;
const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;

export function setupErrorReporting() {
    if (!API_KEY) {
        console.warn("No Bugsnag API key was detected, error reporting is disabled");
        return {ErrorBoundary: BasicErrorBoundary};
    }
    console.debug("Configuring Bugsnag error reporting");
    Bugsnag.start({
        apiKey: API_KEY,
        plugins: [new BugsnagPluginReact(React)],
        appVersion: APP_VERSION,
        enabledReleaseStages: ["production", "staging"],
        maxBreadcrumbs: 50,
        maxEvents: 20,
    })
}

export function getErrorBoundary() {
    return Bugsnag.getPlugin('react');
}

export function reportError(e) {
    if (!API_KEY) {
        return;
    }
    try {
        Bugsnag.notify(e);
    } catch (e) {
        console.error("Cannot report error to Bugsnag", e);
    }
}
