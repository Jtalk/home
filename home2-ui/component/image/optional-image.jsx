import {Image} from "semantic-ui-react";
import React from "react";
import {IdImage} from "./id-image";

export const OptionalImage = function ({src, id, ...props}) {
    if (id) {
        return <IdImage id={id} {...props}/>
    }
    src = src || null;
    return src && <Image src={src} {...props}/>
}
