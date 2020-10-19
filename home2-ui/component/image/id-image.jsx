import {Image} from "semantic-ui-react";
import {imageUrl} from "../../utils/image";
import React from "react";

export const IdImage = function ({id, ...props}) {
    id = id || null;
    return id && <Image src={imageUrl(id)} {...props}/>
}
