import React from "react";

export const HeaderSearch = function () {
    return <div className="ui right aligned category search item">
        <div className="ui transparent icon input">
            <input className="prompt" type="text" placeholder="Search..."/>
            <i className="search link icon"/>
        </div>
        <div className="results"/>
    </div>
};