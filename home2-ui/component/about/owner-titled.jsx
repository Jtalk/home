import {useOwner} from "../../data/hooks/owner";
import React from "react";
import Head from "next/head";

export const OwnerTitled = function ({title, subtitle}) {
    let {name} = useOwner() || {};
    return <Head>
        <title>{subtitle ? `${subtitle} | ` : null}{title}{name ? ` | ${name}` : null}</title>
    </Head>
};
