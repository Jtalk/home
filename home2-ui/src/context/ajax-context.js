import {Ajax} from "../data/ajax-requests";
import React, {createContext, useContext, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import _ from "lodash";

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
    let dispatch = useDispatch();
    return useEffect(() => {dispatch(loader(ajax))}, [ajax, loader, dispatch]);
}

export function useLoader(loader, ...args) {
    let dispatch = useDispatch();
    let [prevArgs, setArgs] = useState(args);
    if (!_.isEqual(prevArgs, args)) {
        setArgs(args);
    }
    return useEffect(() => {dispatch(loader(...prevArgs))}, [loader, prevArgs, dispatch]);
}