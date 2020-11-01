import {imageUrl} from "../../utils/image";
import React from "react";
import dynamic from "next/dynamic";

export const IdImage = function ({id, ...props}) {
    id = id || null;
    const Image = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Image"));
    return id && <Image src={imageUrl(id)} {...props}/>
}
