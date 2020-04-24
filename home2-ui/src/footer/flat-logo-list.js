import React from "react";
import "./flat-logo-list.css";

const LOGO_HEIGHT = '40px';

export const FlatLogoList = function ({logos, className}) {
    return <div className={className}>
        {logos.map(logo => <Logo key={logo.name + logo.src} {...logo}/>)}
    </div>
}

export const Logo = function (logo) {
    return <a className="logo" href={logo.href}>
        <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name}/>
    </a>
}