import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const InfoMessage = function ({ header, children, ...rest }) {
  return (
    <Message {...rest}>
      <Message.Header data-id="message-header">{header}</Message.Header>
      <p>{children}</p>
    </Message>
  );
};
