import React from "react";
import { IdImage } from "./id-image";
import dynamic from "next/dynamic";

export const OptionalImage = function ({ src, id, ...props }) {
  if (id) {
    return <IdImage id={id} {...props} />;
  }
  src = src || null;
  const Image = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Image"));
  return src && <Image src={src} {...props} />;
};
