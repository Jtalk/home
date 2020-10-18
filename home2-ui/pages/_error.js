import {WebError} from "../component/error/web-error";
import React from "react";

const Error = ({code, message}) => {
  console.error(`wtf2`, code, message);
  return <WebError httpCode={code} message={message}/>
}

Error.getInitialProps = ({res, err}) => {
  const code = res ? res.statusCode : err ? err.statusCode : 404;
  const result = { code, message: code === 404 ? "Not Found" : "Internal Error" }
  console.error(`wtf`, result);
  return result;
}

export default Error;
