import { HeaderMenuItem } from "./header-menu-item";
import React from "react";

export default function AdminMenu({ activeRoute }) {
  return (
    <>
      <HeaderMenuItem active={activeRoute} data-id="bio" title={"Bio"} href={"/admin/bio"} />
      <HeaderMenuItem active={activeRoute} data-id="projects" title={"Projects"} href={"/admin/projects"} />
      <HeaderMenuItem active={activeRoute} data-id="blog" title={"Blog"} href={"/admin/blog/articles"} />
      <HeaderMenuItem active={activeRoute} data-id="images" title={"Images"} href={"/admin/images"} />
      <HeaderMenuItem active={activeRoute} data-id="footer" title={"Footer"} href={"/admin/footer"} />
    </>
  );
}
