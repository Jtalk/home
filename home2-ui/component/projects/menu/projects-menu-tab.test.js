import { shallow } from "enzyme";
import { ProjectTab } from "./projects-menu-tab";
import Link from "next/link";
import React from "react";

describe("<ProjectTab/>", () => {
  let project = { id: "project-1", title: "Project 1", href: "/project-1" };
  it("renders active item as a div", () => {
    let result = shallow(<ProjectTab active project={project} />);
    expect(result.find("div.active.item").prop("children")).toBe(project.title);
  });
  it("renders inactive item as a link", () => {
    let result = shallow(<ProjectTab project={project} />);
    expect(result.find(Link).props()).toMatchObject({
      href: "/projects" + project.href,
      children: <a>{project.title}</a>,
    });
  });
});
