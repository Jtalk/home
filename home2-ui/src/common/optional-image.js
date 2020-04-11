import {imageUrl} from "../utils/image";
import {Image} from "semantic-ui-react";
import React from "react";

export const OptionalImage = function ({src, id, ...props}) {
    if (id) {
        src = imageUrl(id);
    }
    src = src || null;
    return src && <Image src={src} {...props}/>
}