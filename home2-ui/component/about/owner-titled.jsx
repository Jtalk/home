import React from "react";
import Head from "next/head";
import { useOwner } from "../../data/hooks/owner/get";

export const OwnerTitled = function ({ title, subtitle }) {
  const { data } = useOwner();
  const { name } = data || {};
  return (
    <Head>
      <title>
        {subtitle ? `${subtitle} | ` : null}
        {title}
        {name ? ` | ${name}` : null}
      </title>
    </Head>
  );
};
