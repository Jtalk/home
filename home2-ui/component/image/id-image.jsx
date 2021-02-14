import { imageUrl } from "../../utils/image";
import React from "react";

export const IdImage = React.forwardRef(({ id, imgRef, ...props }, ref) => {
  id = id || null;
  return id && <img ref={ref} src={imageUrl(id)} {...props} />;
});
