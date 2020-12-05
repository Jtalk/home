import React from "react";
import { useDataUrl } from "../../../utils/file-converter-context";
import { OptionalImage } from "../../image/optional-image";

export const ImageUploadPreview = function ({ src, alt, className, ...rest }) {
  src = useDataUrl(src);
  return <OptionalImage className={className} src={src} alt={alt} {...rest} />;
};
