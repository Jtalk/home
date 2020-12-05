import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const SuccessMessage = function ({ message, ...rest }) {
  return (
    <Message success {...rest}>
      {message}
    </Message>
  );
};
