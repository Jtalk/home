import {Image} from "semantic-ui-react";
import React from "react";
import {useDataUrl} from "../../utils/file-converter-context";

export const ImageUploadPreview = function ({src, alt, className}) {
    src = useDataUrl(src);
    return (src && <Image className={className} src={src} alt={alt}/>) || null;
};