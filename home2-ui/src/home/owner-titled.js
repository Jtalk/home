import {useOwner} from "../data/reduce/owner";
import {Titled} from "react-titled";
import React from "react";

export const OwnerTitled = function ({children}) {
    let {name} = useOwner();
    return <Titled title={() => name}>
        {children}
    </Titled>
};