import {Placeholder} from "semantic-ui-react";
import React from "react";

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
export default LinePlaceholderOr;
