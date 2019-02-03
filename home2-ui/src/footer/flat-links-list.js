import React from "react";

export default class FlatLinksList extends React.Component {

    render() {
        let splitter = this.props.splitter || '';
        var result = this.props.links.flatMap(link => {
            return [
                <a href={link.href} key={link.name}>{link.name}</a>,
                splitter
            ];
        });
        if (result.length > 1) {
            result.pop(); // Remove trailing "|"
        }
        return result;
    }

    /**
     * Links will glue to one another or their splitter if no whitespaces were inserted.
     */
    _prepareSplitter() {
        if (!this.props.splitter) {
            return ' ';
        }
        var splitter = this.props.splitter;
        if (!splitter.startsWith(" ")) {
            splitter = " " + splitter;
        }
        if (!splitter.endsWith(" ")) {
            splitter += " ";
        }
        return splitter;
    }
}