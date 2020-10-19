import {Placeholder} from "semantic-ui-react";
import React from "react";

export const ImagePlaceholderOr = function ({loading, children, square, rectangular}) {

    if (!loading) {
        return children;
    }
    return <Placeholder>
        <Placeholder.Image square={square} rectangular={rectangular}/>
    </Placeholder>
}
export default ImagePlaceholderOr;
