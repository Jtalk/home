import {Image} from "semantic-ui-react";
import React from "react";

export const ImageUploadPreview = function ({src, alt, className}) {
    return (src && <Image className={className} src={src} alt={alt}/>) || null;
};