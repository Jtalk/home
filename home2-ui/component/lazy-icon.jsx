import dynamic from "next/dynamic";
import React from "react";

export default function LazyIcon(props) {
  const Icon = dynamic(() => import("semantic-ui-react/dist/commonjs/elements/Icon"));
  return <Icon {...props} />;
}
