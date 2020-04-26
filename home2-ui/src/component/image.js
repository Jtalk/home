import {imageUrl} from "../utils/image";
import {Image} from "semantic-ui-react";
import React from "react";

export const OptionalImage = function ({src, id, ...props}) {
    if (id) {
        return <IdImage id={id} {...props}/>
    }
    src = src || null;
    return src && <Image src={src} {...props}/>
}

export const IdImage = function ({id, ...props}) {
    id = id || null;
    return id && <Image src={imageUrl(id)} {...props}/>
}