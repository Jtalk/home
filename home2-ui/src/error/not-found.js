import React from "react";
import {WebError} from "./web-error";
import {useLocation} from "react-router";

export const NotFound = function () {
    let location = useLocation();
    console.log("Page not found", location);
    return <WebError httpCode={404} message="Not Found"/>
};