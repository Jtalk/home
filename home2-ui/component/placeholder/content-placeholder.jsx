import React from "react";
import Placeholder from "semantic-ui-react/dist/commonjs/elements/Placeholder";

export const ContentPlaceholderOr = function ({ loading, children, header, lines }) {
  if (!loading) {
    return children;
  }
  header = header || null;
  return (
    <Placeholder fluid>
      {header && (
        <Placeholder.Header>
          <Placeholder.Line length="medium" />
        </Placeholder.Header>
      )}
      <Placeholder.Paragraph>
        {Array(lines)
          .fill()
          .map((_, i) => (
            <Placeholder.Line key={i} />
          ))}
      </Placeholder.Paragraph>
    </Placeholder>
  );
};
export default ContentPlaceholderOr;
