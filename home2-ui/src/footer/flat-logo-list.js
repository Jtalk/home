import React from "react";

const LOGO_HEIGHT = '40px';

export const FlatLogoList = function ({logos, spacing}) {
    return logos.map((logo, i) => {
        let style = {};
        if (i > 0 && spacing) {
            style = {marginLeft: spacing + ' !important'};
        }
        return <a key={logo.name} href={logo.href} style={style}>
            <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name}/>
        </a>
    });
}