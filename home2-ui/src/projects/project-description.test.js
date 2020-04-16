import React from 'react';
import {shallow} from "enzyme";
import {ProjectDescription} from "./project-description";
import {MarkdownTextArea} from "../common/text-area";
import {OptionalImage} from "../common/image";

  describe("<ProjectDescription/>", () => {
  let project = {
    title: "Sample Project",
    logoId: "some-id",
    description: "A sample project description with **stuff**",
    links: [
      { name: "Link 1", href: "/test/link1" },
      { name: "Link 2", href: "/test/link2" },
      { name: "Link 3", href: "/test/link3" },
    ]
  };
  it('renders all links', () => {
    let result = shallow(<ProjectDescription {...project} />);
    expect(result.find("a").filter({ href: project.links[0].href }).props()).toMatchObject({children: project.links[0].name});
    expect(result.find("a").filter({ href: project.links[1].href }).props()).toMatchObject({children: project.links[1].name});
    expect(result.find("a").filter({ href: project.links[2].href }).props()).toMatchObject({children: project.links[2].name});
  });
  it('renders logo', () => {
    let result = shallow(<ProjectDescription {...project} />);
    expect(result.find(OptionalImage).props()).toMatchObject({id: project.logoId});
  });
  it('renders text', () => {
    let result = shallow(<ProjectDescription {...project} />);
    console.log("result123", result.html());
    expect(result.find(MarkdownTextArea).prop("children")).toEqual(project.description);
  });
});
