import React from "react";
import {Preview} from "./text-area-preview";

export const PreviewOnly = function ({children}) {
    let previewChildren = [];
    React.Children.forEach(children, child => {
        if (child.type === Preview) {
            previewChildren.push(child);
        }
    });
    if (previewChildren.length <= 0) {
        console.warn("Cannot find a preview tag among", children, "using a default preview");
        return <p>
            <i>No preview available for this entry</i>
        </p>
    }
    return previewChildren;
};
