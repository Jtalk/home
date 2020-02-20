import React from "react";
import "../bbcode/tags";
import {WebError} from "./web-error";

export const NotFound = function ({location}) {

    console.log("Page not found: " + location);
    return <WebError httpCode={404} message="Not Found"/>
};