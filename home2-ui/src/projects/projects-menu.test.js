import React from 'react';
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {expect} from "chai";
import {Link} from "react-router-dom";
import ProjectsMenu from "./projects-menu";

Enzyme.configure({ adapter: new Adapter() });

describe("<ProjectsMenu/>", () => {
  let projects = [
    { id: "project-1", title: "Project 1", href: "/project-1"},
    { id: "project-2", title: "Project 2", href: "/project-2"},
    { id: "project-3", title: "Project 3", href: "/project-3"},
  ];
  it('renders inactive item as link', () => {
    let result = shallow(<ProjectsMenu projects={projects}/>);
    expect(result.find(Link).at(0).props()).to.include({to: projects[0].href, children: projects[0].title});
    expect(result.find(Link).at(1).props()).to.include({to: projects[1].href, children: projects[1].title});
    expect(result.find(Link).at(2).props()).to.include({to: projects[2].href, children: projects[2].title});
  });
  it('renders active item as non-link', () => {
    let result = shallow(<ProjectsMenu projects={projects} selectedProjectId={projects[1].id}/>);
    expect(result.find(Link).at(0).props()).to.include({to: projects[0].href, children: projects[0].title});
    expect(result.find(Link).at(1).props()).to.include({to: projects[2].href, children: projects[2].title});
    expect(result.find("div.active.item").exists()).to.be.equal(true);
  });
});
