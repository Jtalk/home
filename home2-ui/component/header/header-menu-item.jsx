import React from "react";
import Link from "next/link";
import LazyIcon from "../lazy-icon";

export const HeaderMenuItem = function ({ title, href, active, exact, icon }) {
  icon = icon || null;
  const isActive = exact ? active === href : active.startsWith(href);
  return (
    <Link href={href}>
      <a className={isActive ? "active item" : "item"}>
        {icon && <LazyIcon name={icon} />}
        {title}
      </a>
    </Link>
  );
};
