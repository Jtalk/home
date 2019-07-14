import {Ajax} from "../data/ajax-requests";
import React, {createContext, useContext, useEffect} from "react";


export const defaultAjax = new Ajax();
export const AjaxContext = createContext();

export const AjaxProvider = function ({children, ajax}) {
    ajax = ajax || defaultAjax;
    return <AjaxContext.Provider value={ajax}>
        {children}
    </AjaxContext.Provider>
};

export function useAjax() {
    return useContext(AjaxContext);
}

export function useAjaxLoader(loader) {
    let ajax = useAjax();
    return useEffect(() => {loader(ajax)}, [ajax, loader]);
}