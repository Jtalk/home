import React from "react";
import { WebError } from "./web-error";
import { useRouter } from "next/router";

export const NotFound = function () {
  const router = useRouter();
  console.error("Page not found", router.asPath);
  return <WebError httpCode={404} message="Not Found" />;
};
