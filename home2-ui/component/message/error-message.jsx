import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const ErrorMessage = function ({ message }) {
  return (
    <Message error>
      <Message.Header>Error</Message.Header>
      {message}
    </Message>
  );
};
