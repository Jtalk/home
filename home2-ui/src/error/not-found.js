import React from "react";
import "../bbcode/tags";
import WebError from "./web-error";

export default class NotFound extends React.Component {

    render() {
        console.log("Page not found: " + this.props.location);
        return <WebError httpCode={404} message="Not Found"/>
    }
}