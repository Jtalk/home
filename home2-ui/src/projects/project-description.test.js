import React from 'react';
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {expect} from "chai";
import {Link} from "react-router-dom";
import ProjectDescription from "./project-description";
import {Image} from "semantic-ui-react";

Enzyme.configure({ adapter: new Adapter() });

describe("<ProjectDescription/>", () => {
  let project = {
    title: "Sample Project",
    logo: "/test/logo.jpg",
    description: "A sample project description with [b]stuff[/b]",
    links: [
      { name: "Link 1", href: "/test/link1" },
      { name: "Link 2", href: "/test/link2" },
      { name: "Link 3", href: "/test/link3" },
    ]
  };
  it('renders all links', () => {
    let result = shallow(<ProjectDescription {... project} />);
    expect(result.find(Link).filter({ to: project.links[0].href }).props()).to.include({children: project.links[0].name});
    expect(result.find(Link).filter({ to: project.links[1].href }).props()).to.include({children: project.links[1].name});
    expect(result.find(Link).filter({ to: project.links[2].href }).props()).to.include({children: project.links[2].name});
  });
  it('renders logo', () => {
    let result = shallow(<ProjectDescription {... project} />);
    expect(result.find(Image).props()).to.include({src: project.logo});
  });
  it('renders text', () => {
    let result = shallow(<ProjectDescription {... project} />);
    let text = result.find("strong").filter({children: ["stuff"]}).parent().html();
    expect(text).to.include("A sample project description with <strong>stuff</strong>");
  });
});
