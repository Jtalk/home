import React from "react";
import dynamic from "next/dynamic";

const Image = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Image"));

export const LazyImage = function (props) {
  return <Image {...props} />;
};
