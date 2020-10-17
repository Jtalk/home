import React, {createContext, useContext} from "react";

export const RenderMode = {
    MENU: Symbol("menu"),
    ROUTER: Symbol("router"),
};

const NavigationRenderContext = createContext();

export const RenderModeProvider = function ({renderMode, children}) {
    return <NavigationRenderContext.Provider value={renderMode}>
        {children}
    </NavigationRenderContext.Provider>
};

export function useRenderMode() {
    return useContext(NavigationRenderContext);
}

