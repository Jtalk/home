import React from "react";
import dynamic from "next/dynamic";

export const LazyImage = function (props) {
  const Image = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Image"));
  return <Image {...props} />;
};
