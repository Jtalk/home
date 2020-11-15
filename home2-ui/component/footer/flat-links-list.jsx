import React from "react";
import { VerticalSeparator } from "./vertical-separator";
import flatMap from "lodash/flatMap";

export const FlatLinksList = function ({ links, separator }) {
  let result = flatMap(links, (link) => {
    return [
      <a href={link.href} key={link.caption + link.href}>
        {link.caption}
      </a>,
      <VerticalSeparator sparse key={link.caption + "-separator"} separator={separator} />,
    ];
  });
  if (result.length > 1) {
    result.pop(); // Remove trailing "|"
  }
  return <div data-id="footer-links-list">{result}</div>;
};
