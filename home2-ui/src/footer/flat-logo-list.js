import React from "react";
import "./flat-logo-list.css";

const LOGO_HEIGHT = '40px';

export const FlatLogoList = function ({logos, className}) {
    return <div className={className}>
        {logos.map(logo => <Logo {...logo}/>)}
    </div>
}

export const Logo = function (logo) {
    return <a key={logo.name} className="logo" href={logo.href}>
        <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name}/>
    </a>
}