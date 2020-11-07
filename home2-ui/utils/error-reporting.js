import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import React from "react";
import {BasicErrorBoundary} from "./basic-error-boundary";
import getConfig from "next/config";

const {publicRuntimeConfig: config} = getConfig() || {};

let ErrorBoundary = null;

export function setupErrorReporting() {
    if (ErrorBoundary) {
        return {ErrorBoundary};
    }
    if (!config.bugsnag.key) {
        console.warn("No Bugsnag API key was detected, error reporting is disabled");
        ErrorBoundary = BasicErrorBoundary
        return {ErrorBoundary};
    }
    console.debug("Configuring Bugsnag error reporting");
    Bugsnag.start({
        apiKey: config.bugsnag.key,
        plugins: [new BugsnagPluginReact(React)],
        appVersion: config.bugsnag.version,
        enabledReleaseStages: ["production", "staging"],
        maxBreadcrumbs: 50,
        maxEvents: 20,
    });
    ErrorBoundary = Bugsnag.getPlugin('react');
    return {ErrorBoundary};
}

export function reportError(e) {
    if (!config.bugsnag.key) {
        return;
    }
    try {
        Bugsnag.notify(e);
    } catch (e) {
        console.error("Cannot report error to Bugsnag", e);
    }
}
