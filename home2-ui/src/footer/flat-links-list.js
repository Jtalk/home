import React from "react";
import VerticalSeparator from "./vertical-separator";

export default class FlatLinksList extends React.Component {

    render() {
        var result = this.props.links.flatMap(link => {
            return [
                <a href={link.href} key={link.caption}>{link.caption}</a>,
                <VerticalSeparator key={link.caption + "-separator"} separator={this.props.separator}/>
            ];
        });
        if (result.length > 1) {
            result.pop(); // Remove trailing "|"
        }
        return result;
    }
}