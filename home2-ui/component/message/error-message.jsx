import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const ErrorMessage = function ({ message, ...rest }) {
  return (
    <Message error {...rest}>
      <Message.Header data-id="header">Error</Message.Header>
      <span data-id="message">{message}</span>
    </Message>
  );
};
