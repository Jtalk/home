import React from "react";
import { IdImage } from "./id-image";

export const OptionalImage = React.forwardRef(({ src, id, ...props }, ref) => {
  if (id) {
    return <IdImage ref={ref} id={id} {...props} />;
  }
  src = src || null;
  return src && <img ref={ref} src={src} {...props} />;
});
