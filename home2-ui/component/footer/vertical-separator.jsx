import React from "react";

export const VerticalSeparator = function ({ sparse, separator }) {
  return <span>{prepareSeparator(sparse, separator)}</span>;
};

function prepareSeparator(sparse, separator) {
  if (!sparse) {
    return separator || "";
  }
  if (!separator) {
    return " ";
  }
  if (!separator.startsWith(" ")) {
    separator = " " + separator;
  }
  if (!separator.endsWith(" ")) {
    separator += " ";
  }
  return separator;
}
