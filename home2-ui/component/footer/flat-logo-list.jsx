import React from "react";
import classes from "./flat-logo-list.module.css";

const LOGO_HEIGHT = "40px";

export const FlatLogoList = function ({ logos, className }) {
  return (
    <div data-id="footer-logos-list" className={className}>
      {logos.map((logo) => (
        <Logo key={logo.name + logo.src} {...logo} />
      ))}
    </div>
  );
};

export const Logo = function (logo) {
  return (
    <a data-id="footer-logo" className={classes.logo} href={logo.href}>
      <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name} />
    </a>
  );
};
