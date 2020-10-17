import React from "react";
import {useDataUrl} from "../../../utils/file-converter-context";
import {OptionalImage} from "../../image";

export const ImageUploadPreview = function ({src, alt, className}) {
    src = useDataUrl(src);
    return <OptionalImage className={className} src={src} alt={alt}/>;
};
