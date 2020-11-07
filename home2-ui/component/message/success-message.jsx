import React from "react";
import Message from "semantic-ui-react/dist/commonjs/collections/Message";

export const SuccessMessage = function ({ message }) {
  return <Message success>{message}</Message>;
};
