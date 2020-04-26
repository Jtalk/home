import React from "react";
import {VerticalSeparator} from "./vertical-separator";

export const FlatLinksList = function ({links, separator}) {
    let result = links.flatMap(link => {
        return [
            <a href={link.href} key={link.caption + link.href}>{link.caption}</a>,
            <VerticalSeparator sparse key={link.caption + "-separator"} separator={separator}/>
        ];
    });
    if (result.length > 1) {
        result.pop(); // Remove trailing "|"
    }
    return <div>{result}</div>;
}