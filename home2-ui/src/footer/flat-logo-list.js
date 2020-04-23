import React from "react";
import "./flat-logo-list.css";

const LOGO_HEIGHT = '40px';

export const FlatLogoList = function ({logos}) {
    return logos.map((logo, i) => {
        return <a key={logo.name} className="footer logo" href={logo.href}>
            <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name}/>
        </a>
    });
}