import { HeaderMenuItem } from "./header-menu-item";
import React from "react";

export default function MainMenu({ activeRoute, authenticated, type }) {
  return (
    <>
      <HeaderMenuItem exact data-id="header-about" active={activeRoute} title={"About"} href={"/"} />
      <HeaderMenuItem data-id="header-projects" active={activeRoute} title={"Projects"} href={"/projects"} />
      <HeaderMenuItem data-id="header-blog" active={activeRoute} title={"Blog"} href={"/blog/articles"} />
    </>
  );
}
