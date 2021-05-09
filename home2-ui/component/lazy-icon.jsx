import dynamic from "next/dynamic";
import React from "react";

const Icon = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Icon"));

export default function LazyIcon(props) {
  return <Icon {...props} />;
}
