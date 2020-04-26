import React from "react";
import {Placeholder} from "semantic-ui-react";

export const ImagePlaceholderOr = function ({loading, children, square, rectangular}) {

    if (!loading) {
        return children;
    }
    return <Placeholder>
        <Placeholder.Image square={square} rectangular={rectangular}/>
    </Placeholder>
}


export const ContentPlaceholderOr = function ({loading, children, header, lines}) {

    if (!loading) {
        return children;
    }
    header = header || null;
    return <Placeholder fluid>
        {
            header && <Placeholder.Header>
                <Placeholder.Line length="medium"/>
            </Placeholder.Header>
        }
        <Placeholder.Paragraph>
            {Array(lines).fill().map((_, i) => <Placeholder.Line key={i}/>)}
        </Placeholder.Paragraph>
    </Placeholder>
}


export const LinePlaceholderOr = function ({loading, length, children}) {

    if (!loading) {
        return children;
    }
    return <Placeholder>
        <Placeholder.Paragraph>
            <Placeholder.Line length={length}/>
        </Placeholder.Paragraph>
    </Placeholder>
}